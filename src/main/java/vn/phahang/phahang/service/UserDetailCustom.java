package vn.phahang.phahang.service;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component("userDetailCustom")
public class UserDetailCustom implements UserDetailsService {

    private final UserService userService;

    public UserDetailCustom(UserService userService) {
        this.userService = userService;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        vn.phahang.phahang.domain.User user = this.userService.handleGetUserByUsername(username);

        if(user==null){
            throw new UsernameNotFoundException("User/email không hợp lệ!");
        }

        String rawRole = (user.getRole() != null && !user.getRole().isBlank()) 
                ? user.getRole().trim().toUpperCase() 
                : "CUSTOMER";
        
        String roleName = rawRole.startsWith("ROLE_") ? rawRole : "ROLE_" + rawRole;

        return new User(
            user.getEmail(),
            user.getPassword(),
            Collections.singletonList(new SimpleGrantedAuthority(roleName))
        ); 
    }
}
