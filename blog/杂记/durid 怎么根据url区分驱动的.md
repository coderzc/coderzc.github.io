```java
public static String getDriverClassName(String rawUrl) throws SQLException {
    if (rawUrl == null) {
        return null;
    } else if (rawUrl.startsWith("jdbc:derby:")) {
        return "org.apache.derby.jdbc.EmbeddedDriver";
    } else if (rawUrl.startsWith("jdbc:mysql:")) {
        if (mysql_driver_version_6 == null) {
            mysql_driver_version_6 = Utils.loadClass("com.mysql.cj.jdbc.Driver") != null;
        }

        return mysql_driver_version_6 ? "com.mysql.cj.jdbc.Driver" : "com.mysql.jdbc.Driver";
    } else if (rawUrl.startsWith("jdbc:log4jdbc:")) {
        return "net.sf.log4jdbc.DriverSpy";
    } else if (rawUrl.startsWith("jdbc:mariadb:")) {
        return "org.mariadb.jdbc.Driver";
    } else if (!rawUrl.startsWith("jdbc:oracle:") && !rawUrl.startsWith("JDBC:oracle:")) {
        if (rawUrl.startsWith("jdbc:alibaba:oracle:")) {
            return "com.alibaba.jdbc.AlibabaDriver";
        } else if (rawUrl.startsWith("jdbc:microsoft:")) {
            return "com.microsoft.jdbc.sqlserver.SQLServerDriver";
        } else if (rawUrl.startsWith("jdbc:sqlserver:")) {
            return "com.microsoft.sqlserver.jdbc.SQLServerDriver";
        } else if (rawUrl.startsWith("jdbc:sybase:Tds:")) {
            return "com.sybase.jdbc2.jdbc.SybDriver";
        } else if (rawUrl.startsWith("jdbc:jtds:")) {
            return "net.sourceforge.jtds.jdbc.Driver";
        } else if (!rawUrl.startsWith("jdbc:fake:") && !rawUrl.startsWith("jdbc:mock:")) {
            if (rawUrl.startsWith("jdbc:postgresql:")) {
                return "org.postgresql.Driver";
            } else if (rawUrl.startsWith("jdbc:edb:")) {
                return "com.edb.Driver";
            } else if (rawUrl.startsWith("jdbc:odps:")) {
                return "com.aliyun.odps.jdbc.OdpsDriver";
            } else if (rawUrl.startsWith("jdbc:hsqldb:")) {
                return "org.hsqldb.jdbcDriver";
            } else if (rawUrl.startsWith("jdbc:db2:")) {
                return "com.ibm.db2.jcc.DB2Driver";
            } else if (rawUrl.startsWith("jdbc:sqlite:")) {
                return "org.sqlite.JDBC";
            } else if (rawUrl.startsWith("jdbc:ingres:")) {
                return "com.ingres.jdbc.IngresDriver";
            } else if (rawUrl.startsWith("jdbc:h2:")) {
                return "org.h2.Driver";
            } else if (rawUrl.startsWith("jdbc:mckoi:")) {
                return "com.mckoi.JDBCDriver";
            } else if (rawUrl.startsWith("jdbc:cloudscape:")) {
                return "COM.cloudscape.core.JDBCDriver";
            } else if (rawUrl.startsWith("jdbc:informix-sqli:")) {
                return "com.informix.jdbc.IfxDriver";
            } else if (rawUrl.startsWith("jdbc:timesten:")) {
                return "com.timesten.jdbc.TimesTenDriver";
            } else if (rawUrl.startsWith("jdbc:as400:")) {
                return "com.ibm.as400.access.AS400JDBCDriver";
            } else if (rawUrl.startsWith("jdbc:sapdb:")) {
                return "com.sap.dbtech.jdbc.DriverSapDB";
            } else if (rawUrl.startsWith("jdbc:JSQLConnect:")) {
                return "com.jnetdirect.jsql.JSQLDriver";
            } else if (rawUrl.startsWith("jdbc:JTurbo:")) {
                return "com.newatlanta.jturbo.driver.Driver";
            } else if (rawUrl.startsWith("jdbc:firebirdsql:")) {
                return "org.firebirdsql.jdbc.FBDriver";
            } else if (rawUrl.startsWith("jdbc:interbase:")) {
                return "interbase.interclient.Driver";
            } else if (rawUrl.startsWith("jdbc:pointbase:")) {
                return "com.pointbase.jdbc.jdbcUniversalDriver";
            } else if (rawUrl.startsWith("jdbc:edbc:")) {
                return "ca.edbc.jdbc.EdbcDriver";
            } else if (rawUrl.startsWith("jdbc:mimer:multi1:")) {
                return "com.mimer.jdbc.Driver";
            } else if (rawUrl.startsWith("jdbc:dm:")) {
                return "dm.jdbc.driver.DmDriver";
            } else if (rawUrl.startsWith("jdbc:kingbase:")) {
                return "com.kingbase.Driver";
            } else if (rawUrl.startsWith("jdbc:gbase:")) {
                return "com.gbase.jdbc.Driver";
            } else if (rawUrl.startsWith("jdbc:xugu:")) {
                return "com.xugu.cloudjdbc.Driver";
            } else if (rawUrl.startsWith("jdbc:hive:")) {
                return "org.apache.hive.jdbc.HiveDriver";
            } else if (rawUrl.startsWith("jdbc:hive2:")) {
                return "org.apache.hive.jdbc.HiveDriver";
            } else if (rawUrl.startsWith("jdbc:phoenix:thin:")) {
                return "org.apache.phoenix.queryserver.client.Driver";
            } else if (rawUrl.startsWith("jdbc:phoenix://")) {
                return "org.apache.phoenix.jdbc.PhoenixDriver";
            } else if (rawUrl.startsWith("jdbc:kylin:")) {
                return "org.apache.kylin.jdbc.Driver";
            } else if (rawUrl.startsWith("jdbc:elastic:")) {
                return "com.alibaba.xdriver.elastic.jdbc.ElasticDriver";
            } else if (rawUrl.startsWith("jdbc:clickhouse:")) {
                return "ru.yandex.clickhouse.ClickHouseDriver";
            } else {
                throw new SQLException("unkow jdbc driver : " + rawUrl);
            }
        } else {
            return "com.alibaba.druid.mock.MockDriver";
        }
    } else {
        return "oracle.jdbc.OracleDriver";
    }
}
```

#### 注意看mysql那里：
首先尝试加载com.mysql.cj.jdbc.Driver新驱动 ---> 如果新驱动有则用新驱动 ----> 如果没有则加载去
com.mysql.jdbc.Driver 旧版本的驱动
