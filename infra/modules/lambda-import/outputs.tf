output "queue_url" {
  description = "The URL of the queue to post import jobs to"
  value       = aws_sqs_queue.gloss_import.url
}

