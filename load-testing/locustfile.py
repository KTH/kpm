import os
from decouple import config
from locust import HttpUser, task, run_single_user

LOAD_TEST_TOKEN = os.environ.get('LOAD_TEST_TOKEN') if os.environ.get('LOAD_TEST_TOKEN') != None else config('LOAD_TEST_TOKEN')

class HelloWorldUser(HttpUser):
    host = "http://127.0.0.1:3000/kpm"
    sessionUser = None

    def getSession(self):
        res = self.client.get("/auth/load-test-session-init",
                              params = { "id": "u1ifgjmv"},
                              headers = { "authorization": LOAD_TEST_TOKEN })
        if (res.status_code == 200):
            self.sessionUser = { "id": res.content }    
        else:
            self.sessionUser = None


    @task(4)
    def teaching(self):
        if (self.sessionUser == None):
            self.getSession()
        res = self.client.get("/api/teaching")
        res
    
    @task(4)
    def studies(self):
        if (self.sessionUser == None):
            self.getSession()
        res = self.client.get("/api/studies")
        res
    
    @task
    def lang(self):
        if (self.sessionUser == None):
            self.getSession()

        res = self.client.post("/api/lang", json={ "lang": "sv"})
        res


# if launched directly, e.g. "python3 debugging.py", not "locust -f debugging.py"
if __name__ == "__main__":
    run_single_user(HelloWorldUser)