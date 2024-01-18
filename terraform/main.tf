provider "aws" {
  region = var.aws_region
}

############# Linux
resource "aws_instance" "fj_cloud_instance" {
  ami                    = var.ami_id_linux
  instance_type          = var.instance_type_linux
  key_name               = var.key_name
  subnet_id              = var.subnet_id
  vpc_security_group_ids = var.security_group_ids

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

output "public_ip_linux" {
  value = aws_instance.fj_cloud_instance.public_ip
}

output "instance_id_linux" {
  value = aws_instance.fj_cloud_instance.id
}
