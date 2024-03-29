import os
from decouple import config
from random import randint
from locust import HttpUser, task, run_single_user, between

LOAD_TEST_TOKEN = os.environ.get('LOAD_TEST_TOKEN') if os.environ.get(
    'LOAD_TEST_TOKEN') != None else config('LOAD_TEST_TOKEN')

userNames = []
path = os.getcwd() + "/test-users.txt"
if os.path.isfile(path):
    file = open(path, "r")
    userNames = file.readlines()
    userNames = [n.strip() for n in userNames]
    file.close()
else:
    print("No test-users.txt file found in folder: " + os.getcwd())


class HelloWorldUser(HttpUser):
    # host = "http://127.0.0.1:3000/kpm"
    host = "https://app-r.referens.sys.kth.se/kpm"
    sessionUser = None
    constant_pacing = 100

    def on_start(self):
        userId = userNames[randint(0, len(userNames) - 1)]
        res = self.client.get("/auth/load-test-session-init",
                              params={"id": userId},
                              headers={"authorization": LOAD_TEST_TOKEN})
        if (res.status_code == 200):
            self.sessionUser = {"id": res.content}
        else:
            self.sessionUser = None

    @task
    def teaching(self):
        self.client.get("/api/teaching")

    @task
    def studies(self):
        self.client.get("/api/studies")

    # @task(4)
    # def programmes(self):
    #     self.client.get("/api/programmes")

    # @task(4)
    # def groups(self):
    #     self.client.get("/api/groups")

    # @task
    # def lang(self):
    #     self.client.post("/api/lang", json={"lang": "sv"})

    @task(20)
    def getKpmLoader(self):
        self.client.get("/kpm.js")

    @task(2)
    def getAssetJs(self):
        self.client.get("/assets/index.0561e681.js")

    @task(2)
    def getAssetCss(self):
        self.client.get("/assets/index.8de0246a.css")


# if launched directly, e.g. "python3 debugging.py", not "locust -f debugging.py"
if __name__ == "__main__":
    run_single_user(HelloWorldUser)
