FROM dev.k2data.com.cn:5001/nginx:1.13.5
COPY docker/default.conf /etc/nginx/conf.d/
COPY dist /usr/share/nginx/html/

ARG branch
ARG commit
ARG buildtime
ARG owner
ARG env_para
LABEL branch=$branch \
        commit=$commit \
        buildtime=$buildtime \
        owner=$owner \
        env_para=$env_para
