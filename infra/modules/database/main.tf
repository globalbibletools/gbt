terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }

    postgresql = {
      source  = "cyrilgdn/postgresql"
      version = "~> 1.21"
    }
  }

  required_version = ">= 1.2.0"
}

resource "aws_default_vpc" "default" {
  tags = {
    Name = "Default VPC"
  }
}

resource "aws_default_security_group" "default" {
  vpc_id = aws_default_vpc.default.id

  ingress {
    protocol  = -1
    self      = true
    from_port = 0
    to_port   = 0
  }
  ingress {
    protocol    = -1
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = 0
    to_port     = 0
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_instance" "prod" {
  engine                       = "postgres"
  identifier                   = "prod"
  allocated_storage            = 20
  engine_version               = "14.9"
  instance_class               = "db.t3.micro"
  username                     = var.admin_prod_db_username
  password                     = var.admin_prod_db_password
  parameter_group_name         = "default.postgres14"
  skip_final_snapshot          = true
  publicly_accessible          = true
  performance_insights_enabled = true
  deletion_protection          = true
  storage_encrypted            = true
  backup_window                = "09:12-09:42"
  backup_retention_period      = 3
  apply_immediately            = true
}

resource "postgresql_role" "app" {
  login    = true
  name     = var.app_prod_db_username
  password = var.app_prod_db_password
}

resource "postgresql_database" "prod" {
  name = "prod"
}

resource "postgresql_grant" "create" {
  database    = "prod"
  role        = postgresql_role.app.name
  schema      = "public"
  object_type = "database"
  privileges  = ["CREATE"]
}
