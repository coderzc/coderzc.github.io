# How to trace Pulsar messages with OpenTelemetry Instrumentation and Jaeger

[OpenTelemetry](https://opentelemetry.io/) is an observability framework – an API, SDK, and tools that are designed to aid in the generation and collection of application telemetry data such as metrics, logs, and traces.

This blog guides you through every step of how to trace Pulsar messages by Jaeger through the OpenTelemetry Instrumentation Java agent.

## Prerequisite

Before getting started, make sure you have installed JDK 8, Maven 3, and Pulsar (cluster or standalone). If you do not have an available Pulsar, follow the [instructions](http://pulsar.apache.org/docs/en/standalone/) to install one.

## Step 1: Start a Jaeger backend

1. Start a Jaeger backend in Docker.

```bash
docker run -d -p 6831:6831/udp -p 16686:16686 -p 14250:14250 jaegertracing/all-in-one:latest
```

If you have successfully started Jaeger, you can open the Jaeger UI website successfully.

> If you do not have a Docker environment, you can [download the binaries](https://www.jaegertracing.io/download/)
>  or [build from source](https://www.jaegertracing.io/docs/1.17/getting-started/#from-source).

1. Visit http://localhost:16686 to open the Jaeger UI website without a username or password.

   ![image-20230329203753594.png](/Users/zc/Downloads/79cde5f0-f42f-466b-813c-bcac2ba846d1_Export-3fd12ec6-fba4-4e92-b6a4-a754048a0585/How to trace Pulsar messages with OpenTelemetry In d52f65184dd14e62bc62dfb047ab9825/image-20230329203753594.png)

## ****Step 2: Start a `opentelemetry-collector` and download `opentelemetry-javaagent`**

1. Start a [opentelemetry-collector](https://opentelemetry.io/docs/collector/) with Jaeger exporter in Docker.

> If you do not have a Docker environment, you also can use other way to start opentelemetry-collector: [https://opentelemetry.io/docs/collector/getting-started/](https://opentelemetry.io/docs/collector/getting-started/)

```bash
docker run -v $(pwd)/config.yaml:/etc/otelcol-contrib/config.yaml otel/opentelemetry-collector:0.74.0
```

`config.yaml`:

```yaml
processors:
  batch:

receivers:
  otlp:
    protocols:
      grpc:

exporters:
  jaeger:
    endpoint: localhost:14250
    tls:
      insecure: true # Disable security certification

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [jaeger]
```

1. Download [opentelemetry-javaagent.jar](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar) from [Releases](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases) of the `opentelemetry-java-instrumentation` repo and place the JAR in your preferred directory. The JAR file contains the agent and instrumentation libraries.

## Step 3: Write sample code

For easier understanding, this blog takes a usage scenario as an example. Suppose that you have three jobs and two topics. Job-1 publishes messages to the topic-A and Job-2 consumes messages from the topic-A. When Job-2 receives a message from topic-A, Job-2 sends a message to the topic-B, and then Job-3 consumes messages from topic-B. So there are two topics, two producers and two consumers in this scenario.

According to the scenario described previously, you need to start three applications to finish this job.

- Job-1: publish messages to topic-A
- Job-2: consume messages from topic-A and publish messages to topic-B
- Job-3: consume messages from topic-B

### Job-1

This example shows how to publish messages to topic-A in Java.

```java
PulsarClient client = PulsarClient.builder()
        .serviceUrl("pulsar://localhost:6650")
        .build();

Producer<String> producerA = client.newProducer(Schema.STRING)
        .topic("topic-A")
        .create();

for (int i = 0; i < 10; i++) {
    producerA.newMessage().value(String.format("[%d] Hello", i)).send();
}
```

### Job-2

This example shows how to consume messages from topic-A and publish messages to topic-B in Java.

```java
PulsarClient client = PulsarClient.builder()
                .serviceUrl("pulsar://localhost:6650")
          .build();

Producer<String> producerB = client.newProducer(Schema.STRING)
    .topic("topic-B")
    .create();

Consumer<String> consumer = client.newConsumer(Schema.STRING)
        .topic("topic-A")
        .subscriptionName("open-telemetry")
        .subscriptionType(SubscriptionType.Shared)
        .messageListener((MessageListener<String>) (consumer0, msg) -> {
            try {
                TypedMessageBuilder<String> messageBuilder = producerB.newMessage();
                messageBuilder.value(msg.getValue() + " Pulsar and OpenTelemetry!");
                messageBuilder.send();
                consumer0.acknowledge(msg);
            } catch (PulsarClientException e) {
                throw new RuntimeException(e);
            }
        })
        .subscribe();
```

### Job-3

This example shows how to consume messages from topic-B in Java.

```java
PulsarClient client = PulsarClient.builder()
                .serviceUrl("pulsar://localhost:6650")
                .build();

Consumer<String> consumer = client.newConsumer(Schema.STRING)
        .topic("topic-B")
        .subscriptionName("open-telemetry")
        .subscriptionType(SubscriptionType.Shared)
        .subscribe();

while (true) {
    Message<String> received = consumer.receive(5, TimeUnit.MINUTES);
    if (received == null) {
        break;
    }
    System.out.println(received.getValue());
    consumer.acknowledge(received);
}
```

## ****Step 4: Use opentelemetry-javaagent to start your app****

Please compile and package Job-1, Job-2 and Job-3 into the executable JAR file, get three JAR files Job-1.jar, Job-2.jar, Job-3.jar.

**Now, add `-javaagent:path/to/opentelemetry-javaagent.jar` and other config to your JVM’s startup arguments and launch your app:**

> For more agent config, please see: [opentelemetry_sdk_autoconfigure](https://github.com/open-telemetry/opentelemetry-java/blob/main/sdk-extensions/autoconfigure/README.md#opentelemetry-sdk-autoconfigure)

```bash
java -javaagent:path/opentelemetry-javaagent.jar \
     -Dotel.resource.attributes=service.name=${JobName} \
     -Dotel.traces.exporter=otlp \
     -jar ${JobName}.jar
```

You can see the Job-3 receives logs in the console as below:

```java
[0] Hello Pulsar and OpenTelemetry!
[1] Hello Pulsar and OpenTelemetry!
[2] Hello Pulsar and OpenTelemetry!
[3] Hello Pulsar and OpenTelemetry!
[4] Hello Pulsar and OpenTelemetry!
[5] Hello Pulsar and OpenTelemetry!
[6] Hello Pulsar and OpenTelemetry!
[7] Hello Pulsar and OpenTelemetry!
[8] Hello Pulsar and OpenTelemetry!
[9] Hello Pulsar and OpenTelemetry!
```

Congratulations, your jobs work well. Now you can open the Jaeger UI again and there are ten traces in the Jaeger.

![Untitled](/Users/zc/Downloads/79cde5f0-f42f-466b-813c-bcac2ba846d1_Export-3fd12ec6-fba4-4e92-b6a4-a754048a0585/How to trace Pulsar messages with OpenTelemetry In d52f65184dd14e62bc62dfb047ab9825/Untitled.png)

You can click a job name to view the details of a trace.

![Untitled](/Users/zc/Downloads/79cde5f0-f42f-466b-813c-bcac2ba846d1_Export-3fd12ec6-fba4-4e92-b6a4-a754048a0585/How to trace Pulsar messages with OpenTelemetry In d52f65184dd14e62bc62dfb047ab9825/Untitled 1.png)

![Untitled](/Users/zc/Downloads/79cde5f0-f42f-466b-813c-bcac2ba846d1_Export-3fd12ec6-fba4-4e92-b6a4-a754048a0585/How to trace Pulsar messages with OpenTelemetry In d52f65184dd14e62bc62dfb047ab9825/Untitled 2.png)

The span name is formatted as `send` and `receive`, which makes it easy to tell whether it is a producer or a consumer.

> For more message system semantic conventions please see: [semantic_conventions/messaging](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/trace/semantic_conventions/messaging.md)

## Extensions**: How to generate the trace ID manually**

First, you need to introduce the `opentelemetry-api` dependency in your project.

```xml
<dependency>
   <groupId>io.opentelemetry</groupId>
   <artifactId>opentelemetry-api</artifactId>
   <version>1.25.0</version>
</dependency>
```

Replace Job-1 with the following code

> Note: the manually generated traceId/spanId must be valid traceId/spanId, please see: [TraceId#isValid](https://github.com/open-telemetry/opentelemetry-java/blob/47ee573f07c9025547d494608863d9314b29df4b/api/all/src/main/java/io/opentelemetry/api/trace/TraceId.java#L55-L66) and [SpanId#isValid](https://github.com/open-telemetry/opentelemetry-java/blob/47ee573f07c9025547d494608863d9314b29df4b/api/all/src/main/java/io/opentelemetry/api/trace/SpanId.java#L51-L62)

```java
public class Job1 {
    public static void main(String[] args) throws PulsarClientException, ClassNotFoundException {
        PulsarClient client = PulsarClient.builder()
                .serviceUrl("pulsar://localhost:6650")
                .build();

        Producer<String> producerA = client.newProducer(Schema.STRING)
                .topic("topic-A")
                .create();
        for (int i = 0; i < 10; i++) {
            String traceId = generateTraceId();
            System.out.printf("traceId: %s, isValid: %s\n", traceId, TraceId.isValid(traceId));
            Span span = createSpanLinkedToParent(traceId);
            try (Scope __ = span.makeCurrent()) {
                producerA.newMessage().value(String.format("[%d] Hello", i)).send();
            } finally {
                span.end();
            }
        }
    }

    private static Span createSpanLinkedToParent(String traceId) {
        SpanContext remoteContext = SpanContext.createFromRemoteParent(
                traceId,
                generateSpanId(),
                TraceFlags.getSampled(),
                TraceState.getDefault());

        return GlobalOpenTelemetry.getTracer("Job-1")
                .spanBuilder("root span")
                .setParent(Context.current().with(Span.wrap(remoteContext)))
                .startSpan();
    }

    public static String generateSpanId() {
        Random random = ThreadLocalRandom.current();

        long id;
        do {
            id = random.nextLong();
        } while(id == 0L);

        return SpanId.fromLong(id);
    }

    public static String generateTraceId() {
        Random random = ThreadLocalRandom.current();
        long idHi = random.nextLong();

        long idLo;
        do {
            idLo = random.nextLong();
        } while(idLo == 0L);

        return TraceId.fromLongs(idHi, idLo);
    }
}
```

Then start Job-1, Job-2, Job-3 as in `step-4`. 

You can see that Job-1 outputs the manually generated traceID.

```bash
traceId: 346198ae5ce064e0c39db27f71c96ad7, isValid: true
traceId: ffa22326aef6a062766bd28913999dec, isValid: true
traceId: b08a78ca2a7b67c7377413d941d6b24a, isValid: true
traceId: 7749c82c6b1496e3842226cb74ffffe1, isValid: true
traceId: 7092dd140b14e55f200fc5612e57acd5, isValid: true
traceId: 2bb13755a34d2fa3108b4a548463b757, isValid: true
traceId: ade8a50fd3edff776b0d562019687788, isValid: true
traceId: 334ec20b06c3209cf681be9e1e40d8b9, isValid: true
traceId: 4c9c234466b081b88ea0ca7846749993, isValid: true
traceId: 9ad50fcb0029148c983ff492357f5e28, isValid: true
```

Open the Jaeger UI again and there are ten traces in the Jaeger.

![Untitled](/Users/zc/Downloads/79cde5f0-f42f-466b-813c-bcac2ba846d1_Export-3fd12ec6-fba4-4e92-b6a4-a754048a0585/How to trace Pulsar messages with OpenTelemetry In d52f65184dd14e62bc62dfb047ab9825/Untitled 3.png)

![Untitled](/Users/zc/Downloads/79cde5f0-f42f-466b-813c-bcac2ba846d1_Export-3fd12ec6-fba4-4e92-b6a4-a754048a0585/How to trace Pulsar messages with OpenTelemetry In d52f65184dd14e62bc62dfb047ab9825/Untitled 4.png)

Now, you can see that the traceID displayed is the same as the traceID you generated manually!

## Summary

As you can see, [OpenTelemetry Instrumentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation) integrates Pulsar client and Jaeger to trace Pulsar messages easily. If you are using Pulsar and OpenTelemetry in your application, do not hesitate to try it out!