package vn.phahang.phahang.service;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import vn.phahang.phahang.repository.UserRepository;
import vn.phahang.phahang.domain.User;

import java.util.Collections;

@Component("userDetailCustom")
public class UserDetailCustom implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailCustom(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = this.userRepository.findByEmail(username);

        if (user == null) {
            throw new UsernameNotFoundException("User/email không hợp lệ!");
        }

        String rawRole = (user.getRole() != null && !user.getRole().isBlank())
                ? user.getRole().trim().toUpperCase()
                : "CUSTOMER";

        String roleName = rawRole.startsWith("ROLE_") ? rawRole : "ROLE_" + rawRole;

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority(roleName))
        );
    }
}
