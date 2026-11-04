package top.sharpcaterpillar.teamsync.service.wecom;

import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import top.sharpcaterpillar.teamsync.controller.WecomPushController;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

class WecomPushControllerTest {
    @Test
    void everyEndpointEnforcesAdministratorCheckBeforeReadingOrSending() throws Exception {
        WecomPushService service = mock(WecomPushService.class);
        doThrow(new IllegalArgumentException("仅平台管理员可管理企业微信推送")).when(service).requireAdmin();
        MockMvc mvc = MockMvcBuilders.standaloneSetup(new WecomPushController(service)).build();
        String base = "/api/system/wecom-push";
        mvc.perform(get(base + "/settings")).andExpect(jsonPath("$.code").value(400));
        mvc.perform(get(base + "/projects")).andExpect(jsonPath("$.code").value(400));
        mvc.perform(get(base + "/jobs")).andExpect(jsonPath("$.code").value(400));
        mvc.perform(get(base + "/preview/DAILY")).andExpect(jsonPath("$.code").value(400));
        mvc.perform(post(base + "/send/WEEKLY")).andExpect(jsonPath("$.code").value(400));
        mvc.perform(put(base + "/settings").contentType("application/json").content("{}"))
                .andExpect(jsonPath("$.code").value(400));
        verify(service, times(6)).requireAdmin();
        verifyNoMoreInteractions(service);
    }
}
