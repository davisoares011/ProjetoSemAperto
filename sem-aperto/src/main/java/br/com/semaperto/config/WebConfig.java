package br.com.semaperto.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final SessaoInterceptor sessaoInterceptor;

    public WebConfig(SessaoInterceptor sessaoInterceptor) {
        this.sessaoInterceptor = sessaoInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(sessaoInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api/sessao");
    }
}
