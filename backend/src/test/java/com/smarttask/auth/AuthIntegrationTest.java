package com.smarttask.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarttask.auth.AuthDtos.RegisterRequest;
import com.smarttask.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest @AutoConfigureMockMvc @ActiveProfiles("test")
class AuthIntegrationTest {
    @Autowired MockMvc mvc; @Autowired ObjectMapper mapper; @Autowired UserRepository users; @Autowired PasswordEncoder encoder;
    @Test void registerHashesPasswordAndIssuesUsableJwt() throws Exception {
        String json=mapper.writeValueAsString(new RegisterRequest("Portfolio User","person@example.com","Str0ngPass!"));
        String response=mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.user.role").value("USER")).andReturn().getResponse().getContentAsString();
        assertThat(encoder.matches("Str0ngPass!",users.findByEmail("person@example.com").orElseThrow().getPasswordHash())).isTrue();
        String token=mapper.readTree(response).get("token").asText();
        mvc.perform(get("/api/tasks").header("Authorization","Bearer "+token)).andExpect(status().isOk());
    }
    @Test void rejectsInvalidRegistrationAndDuplicateEmail() throws Exception {
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"A\",\"email\":\"bad\",\"password\":\"short\"}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.fields").exists());
        String json=mapper.writeValueAsString(new RegisterRequest("Portfolio User","duplicate@example.com","Str0ngPass!"));
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(json)).andExpect(status().isCreated());
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(json)).andExpect(status().isConflict());
    }
    @Test void malformedJsonReturnsBadRequest() throws Exception {
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content("{broken-json"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.status").value(400));
    }
}
