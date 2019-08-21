FROM debian:jessie

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update \
    && apt-get -y install xserver-xorg

VOLUME /tmp/.X11-unix

# FIXME we want to auto generate this file when the image is started:
# Get bus id
# nvidia-xconfig --query-gpu-info
# Generate config using bus id
# nvidia-xconfig -a --allow-empty-initial-configuration --use-display-device=None --virtual=1920x1200 --busid "${BUS_ID}"
COPY xorg.conf /etc/X11/xorg.conf

CMD ["/usr/bin/Xorg", "-seat", "1", -ac", "-noreset", "-config", "/etc/X11/xorg.conf", ":0"]