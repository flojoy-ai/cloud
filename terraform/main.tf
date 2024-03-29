provider "aws" {
  region = var.aws_region
}

############# Linux
resource "aws_instance" "fj_cloud_instance" {
  ami           = var.ami_id_linux
  instance_type = var.instance_type_linux
  key_name      = var.key_name


  user_data = templatefile("${path.module}/user-data.sh", {})

  root_block_device {
    delete_on_termination = true
    volume_size           = abs(30)
    volume_type           = "gp3"

  }
  tags = {
    Name = "fj_cloud"
  }
}

output "public_ip_fj_cloud" {
  value = aws_instance.fj_cloud_instance.public_ip
}

resource "time_sleep" "wait_for_user_data_execution" {
  depends_on      = [aws_instance.fj_cloud_instance]
  create_duration = "10m"
}

resource "aws_ami_from_instance" "fj_cloud_ami" {
  name               = "Flojoy-Cloud-AMI"
  source_instance_id = aws_instance.fj_cloud_instance.id
  depends_on         = [time_sleep.wait_for_user_data_execution]

  lifecycle {
    prevent_destroy = true
  }
}

