# Load Testing

## Installation

Tests are written in Python 3 for the LOCUST load testing library.

```sh
$ pip install -r requirements.txt
```

[Install Locust](https://docs.locust.io/en/stable/installation.html#installation)

## Running Load Tests

To run tests, go to the parent folder of this file (README.md). Create a .env file and run the tests:

```sh
$ cp .env.in .env # Edit the .env file appropriately
$ locust
```

## Writing Load Tests

We have focused on load testing backend endpoints because this is where our processing is done. [Read more about adding tests here.](https://docs.locust.io/en/stable/writing-a-locustfile.html#writing-a-locustfile)
