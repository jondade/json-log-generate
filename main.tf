#Variables
variable fastly_key {}

data "local_file" "index" {
    filename = "${path.module}/src/index.html"
}

data "local_file" "stylesheet" {
    filename = "${path.module}/src/json-logging.css"
}

data "local_file" "javascript" {
    filename = "${path.module}/src/json-logging.js"
}


# Add the Fastly provider
provider "fastly" {
  api_key = "${var.fastly_key}"
}

resource "fastly_service_v1" "json-generate" {
  name = "json-generate${terraform.workspace == "test" ? "-test" : ""}"

  domain {
    name    = "json-generator${terraform.workspace == "test" ? "-test": ""}.global.ssl.fastly.net"
  }

  backend {
    address = "172.17.0.10"
    name    = "172.17.0.10"
    port    = 443
  }

  request_setting {
    name = "default"
    force_ssl =  true
  }

  condition {
    name = "Index page"
    priority = 10
    statement = "req.url ~ \"/index.html\" || req.url == \"/\""
    type = "REQUEST"
  }

  condition {
    name = "Stylesheet"
    priority = 10
    statement = "req.url ~ \"/json-logging.css\""
    type = "REQUEST"
  }

  condition {
    name = "Javascript"
    priority = 10
    statement = "req.url ~ \"/json-logging.js\""
    type = "REQUEST"
  }

  response_object {
    name = "index page"
    content = "${data.local_file.index.content}"
    content_type = "text/html"
    request_condition = "Index page"
  }

  response_object {
    name = "Stylesheet"
    content = "${data.local_file.stylesheet.content}"
    content_type = "text/css"
    request_condition = "Stylesheet"
  }

  response_object {
    name = "Javascript"
    content = "${data.local_file.javascript.content}"
    content_type = "application/x-javascript"
    request_condition = "Javascript"}



  /* force_destroy = true */
}
