test:
	docker pull alfg/nginx-rtmp
	docker run -it -p 1935:1935 -p 8080:80 --rm alfg/nginx-rtmp
