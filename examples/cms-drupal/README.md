# Drupal example setup

## Requirements

To run this example, you will need docker and (docker-compose)[https://docs.docker.com/compose/]

## Installation

Configure the .env file for your unix user: 

```
make .env
```

Configure the project (Load composer, fixtures, etc ...)

```bash
make setup
```

You are now setup.

Please visit http://localhost:8080/