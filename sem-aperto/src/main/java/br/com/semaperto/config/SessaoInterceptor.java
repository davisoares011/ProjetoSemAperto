package br.com.semaperto.config;

import br.com.semaperto.repository.UsuarioRepository;
import br.com.semaperto.service.SessaoService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class SessaoInterceptor implements HandlerInterceptor {

    private final UsuarioRepository usuarios;

    public SessaoInterceptor(UsuarioRepository usuarios) {
        this.usuarios = usuarios;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        HttpSession sessao = request.getSession(false);
        Object id = sessao == null ? null : sessao.getAttribute(SessaoService.ATRIBUTO_USUARIO);

        if (id instanceof Long usuarioId && usuarios.existsById(usuarioId)) {
            return true;
        }

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"status\":401,\"mensagem\":\"Entre no sistema para continuar.\"}");
        return false;
    }
}
