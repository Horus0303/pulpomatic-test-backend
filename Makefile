.DEFAULT_GOAL := help

.PHONY: up
up: ## run the project
	@docker-compose run --service-ports --rm seniorcrud || true

.PHONY: stop
stop: ## stop Docker containers without removing them
	@docker-compose stop

.PHONY: down
down: ## stop and remove Docker containers
	@docker-compose down --remove-orphans

.PHONY: rebuild
rebuild: ## rebuild base Docker images
	@docker-compose down --remove-orphans
	@docker-compose build --no-cache

.PHONY: reset
# reset: ## update Docker images and reset local databases
reset: 
	@docker-compose down --volumes --remove-orphans
	@docker-compose pull