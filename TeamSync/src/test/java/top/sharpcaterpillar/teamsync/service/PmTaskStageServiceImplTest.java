package top.sharpcaterpillar.teamsync.service;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.test.util.ReflectionTestUtils;
import top.sharpcaterpillar.teamsync.dto.StageUpdateRequest;
import top.sharpcaterpillar.teamsync.entity.PmTaskStage;
import top.sharpcaterpillar.teamsync.mapper.PmTaskMapper;
import top.sharpcaterpillar.teamsync.mapper.PmTaskStageMapper;
import top.sharpcaterpillar.teamsync.service.impl.PmTaskStageServiceImpl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PmTaskStageServiceImplTest {

    @Test
    void updateStageChangesSortAfterPermissionCheck() {
        TestFixture fixture = newFixture();
        PmTaskStage stage = stage();
        when(fixture.stageMapper.selectById(10L)).thenReturn(stage);
        StageUpdateRequest request = new StageUpdateRequest();
        request.setSort(2);

        PmTaskStage result = fixture.service.updateStage(10L, request, 99L);

        verify(fixture.permissionService).checkStageManagePermission(20L, 99L);
        ArgumentCaptor<PmTaskStage> captor = ArgumentCaptor.forClass(PmTaskStage.class);
        verify(fixture.stageMapper).updateById(captor.capture());
        assertThat(captor.getValue().getSort()).isEqualTo(2);
        assertThat(result.getSort()).isEqualTo(2);
    }

    @Test
    void updateStageRejectsNegativeSort() {
        TestFixture fixture = newFixture();
        when(fixture.stageMapper.selectById(10L)).thenReturn(stage());
        StageUpdateRequest request = new StageUpdateRequest();
        request.setSort(-1);

        assertThatThrownBy(() -> fixture.service.updateStage(10L, request, 99L))
                .hasMessage("排序号不能小于 0");

        verify(fixture.stageMapper, never()).updateById(any(PmTaskStage.class));
    }

    private static TestFixture newFixture() {
        PmTaskStageMapper stageMapper = mock(PmTaskStageMapper.class);
        PmTaskMapper taskMapper = mock(PmTaskMapper.class);
        ProjectPermissionService permissionService = mock(ProjectPermissionService.class);
        PmTaskStageServiceImpl service = new PmTaskStageServiceImpl(taskMapper, permissionService);
        ReflectionTestUtils.setField(service, "baseMapper", stageMapper);
        return new TestFixture(service, stageMapper, permissionService);
    }

    private static PmTaskStage stage() {
        PmTaskStage stage = new PmTaskStage();
        stage.setId(10L);
        stage.setProjectId(20L);
        stage.setName("待办");
        stage.setSort(0);
        return stage;
    }

    private record TestFixture(PmTaskStageServiceImpl service,
                               PmTaskStageMapper stageMapper,
                               ProjectPermissionService permissionService) {
    }
}
