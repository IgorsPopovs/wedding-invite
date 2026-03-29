package com.example.wedding_invite;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController {

    @GetMapping("/wedding-invite")
    public String weddingInvite() {
        return "index";
    }
}