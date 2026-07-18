FROM gradle:8.13-jdk17 AS build
WORKDIR /app
COPY build.gradle settings.gradle ./
COPY src ./src
RUN --mount=type=cache,target=/home/gradle/.gradle \
    gradle bootJar --no-daemon

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system ogret \
    && useradd --system --gid ogret --home-dir /app --shell /usr/sbin/nologin ogret \
    && mkdir -p /app/secrets \
    && chown ogret:ogret /app/secrets
COPY --from=build --chown=ogret:ogret /app/build/libs/*.jar app.jar
COPY --chmod=755 docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
COPY --chmod=755 show-bootstrap-credentials.sh /usr/local/bin/show-bootstrap-credentials
USER ogret
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD curl --fail --silent http://localhost:8080/actuator/health/readiness >/dev/null || exit 1
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["java", "-jar", "app.jar"]
