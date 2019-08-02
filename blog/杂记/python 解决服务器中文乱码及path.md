####
```python
import sys
import io
sys.path.append("~/pythonspace")
sys.stdout = io.TextIOWrapper(sys.stdout.buffer,encoding='utf-8')
```
