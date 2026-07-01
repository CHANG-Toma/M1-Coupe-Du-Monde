package com.cdm.worldcup.config;

import com.cdm.worldcup.config.AppProperties.WorldCup2026;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties(AppProperties.class)
public class RestClientConfig {

    @Bean
    public RestClient worldCupRestClient(AppProperties properties) {
        WorldCup2026 wc = properties.getWorldcup2026();
        return RestClient.builder()
                .baseUrl(wc.getApiUrl())
                .build();
    }
}
