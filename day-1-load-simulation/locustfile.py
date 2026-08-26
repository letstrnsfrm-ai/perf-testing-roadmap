"""
Day 1: Python Locust Alternative Load Test
Run: locust -f locustfile.py --headless -u 10 -r 2 -t 10s --host http://localhost:3000
"""

from locust import HttpUser, task, between

class ArchitectureApiUser(HttpUser):
    wait_time = between(0.5, 1.5)

    @task(3)
    def test_health(self):
        with self.client.get("/api/health", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Health check failed with status {response.status_code}")

    @task(2)
    def test_diagrams(self):
        with self.client.get("/api/diagrams?delay=10", catch_response=True) as response:
            if response.status_code == 200 and response.json().get("count", 0) > 0:
                response.success()
            else:
                response.failure("Diagrams API returned invalid payload")
