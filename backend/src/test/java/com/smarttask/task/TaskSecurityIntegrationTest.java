package com.smarttask.task;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarttask.auth.AuthDtos.RegisterRequest;
import com.smarttask.auth.AuthDtos.AuthResponse;
import com.smarttask.user.AppUser;
import com.smarttask.user.Role;
import com.smarttask.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest @AutoConfigureMockMvc @ActiveProfiles("test")
class TaskSecurityIntegrationTest {
    @Autowired MockMvc mvc; @Autowired ObjectMapper mapper; @Autowired UserRepository users; @Autowired PasswordEncoder encoder;
    @Test void taskDataIsOwnerScopedAndCrudPersists() throws Exception {
        AuthResponse owner=register("owner@example.com");
        AuthResponse other=register("other@example.com");
        String task=mvc.perform(post("/api/tasks").header("Authorization","Bearer "+owner.token()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Portfolio project\",\"status\":\"IN_PROGRESS\",\"priority\":\"HIGH\"}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.status").value("IN_PROGRESS")).andReturn().getResponse().getContentAsString();
        long id=mapper.readTree(task).get("id").asLong();
        mvc.perform(get("/api/tasks/"+id).header("Authorization","Bearer "+other.token())).andExpect(status().isNotFound());
        mvc.perform(get("/api/tasks").header("Authorization","Bearer "+owner.token()).param("q","portfolio").param("sort","title"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.content.length()").value(1));
        mvc.perform(delete("/api/tasks/"+id).header("Authorization","Bearer "+other.token())).andExpect(status().isNotFound());
        mvc.perform(delete("/api/tasks/"+id).header("Authorization","Bearer "+owner.token())).andExpect(status().isNoContent());
    }
    @Test void adminRoutesRequireAdminRole() throws Exception {
        AuthResponse user=register("member@example.com");
        mvc.perform(get("/api/admin/tasks").header("Authorization","Bearer "+user.token())).andExpect(status().isForbidden());
        AppUser admin=users.save(new AppUser("Admin","admin@example.com",encoder.encode("Str0ngPass!"),Role.ADMIN));
        String adminToken=mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"admin@example.com\",\"password\":\"Str0ngPass!\"}"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        mvc.perform(get("/api/admin/tasks").header("Authorization","Bearer "+mapper.readTree(adminToken).get("token").asText())).andExpect(status().isOk());
    }
    private AuthResponse register(String email) throws Exception {
        String body=mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(new RegisterRequest("Test User",email,"Str0ngPass!"))))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return mapper.readValue(body,AuthResponse.class);
    }
}
