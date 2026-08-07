<template>
  <ElDialog
    v-model="visible"
    :title="isEditMode ? '任务详情' : '新建任务'"
    :width="dialogWidth"
    :close-on-click-modal="false"
    :fullscreen="isMobile"
    @open="onDialogOpen"
    @close="onDialogClose"
    class="task-detail-dialog"
  >
    <!-- 移动端：使用 Tabs 切换详情和动态 -->
    <div v-if="isMobile && isEditMode" class="mobile-dialog-content">
      <ElTabs v-model="mobileActiveTab" class="mobile-tabs">
        <ElTabPane label="详情" name="detail">
          <ElScrollbar height="calc(100vh - 200px)">
            <div class="mobile-form-wrapper">
              <!-- 表单内容 -->
              <ElForm ref="formRef" :model="taskForm" :rules="formRules" label-position="top">
                <ElFormItem label="任务标题" prop="title">
                  <ElInput
                    v-model="taskForm.title"
                    placeholder="请输入任务标题"
                    maxlength="200"
                    show-word-limit
                  />
                </ElFormItem>

                <ElFormItem label="任务描述" prop="description">
                  <ElInput
                    v-model="taskForm.description"
                    type="textarea"
                    placeholder="请输入任务描述（选填）"
                    :rows="4"
                    maxlength="1000"
                    show-word-limit
                  />
                </ElFormItem>

                <ElFormItem label="优先级" prop="priority">
                  <ElSelect
                    v-model="taskForm.priority"
                    placeholder="选择优先级"
                    style="width: 100%"
                  >
                    <ElOption
                      v-for="item in priorityOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    >
                      <div class="priority-option">
                        <span class="priority-dot" :class="getPriorityClass(item.value)"></span>
                        <span>{{ item.label }}</span>
                      </div>
                    </ElOption>
                  </ElSelect>
                </ElFormItem>

                <ElRow :gutter="12" class="task-time-row">
                  <ElCol :span="12">
                    <ElFormItem label="开始时间" prop="startTime">
                      <ElDatePicker
                        v-model="taskForm.startTime"
                        type="datetime"
                        placeholder="开始时间"
                        format="MM-DD HH:mm"
                        value-format="YYYY-MM-DDTHH:mm:ss"
                        style="width: 100%"
                      />
                    </ElFormItem>
                  </ElCol>
                  <ElCol :span="12">
                    <ElFormItem label="截止时间" prop="dueTime">
                      <ElDatePicker
                        v-model="taskForm.dueTime"
                        type="datetime"
                        placeholder="截止时间"
                        format="MM-DD HH:mm"
                        value-format="YYYY-MM-DDTHH:mm:ss"
                        style="width: 100%"
                      />
                    </ElFormItem>
                  </ElCol>
                </ElRow>

                <ElFormItem label="负责人" prop="assigneeIds">
                  <ElSelect
                    v-model="taskForm.assigneeIds"
                    multiple
                    filterable
                    placeholder="选择负责人"
                    style="width: 100%"
                    :loading="membersLoading"
                    collapse-tags
                    :max-collapse-tags="2"
                  >
                    <ElOption
                      v-for="member in projectMembers"
                      :key="member.userId"
                      :label="member.nickname || member.username"
                      :value="member.userId"
                    >
                      <div class="assignee-option">
                        <ElAvatar :size="24" :src="member.avatar">
                          {{ (member.nickname || member.username)?.charAt(0) }}
                        </ElAvatar>
                        <span class="assignee-name">{{ member.nickname || member.username }}</span>
                      </div>
                    </ElOption>
                  </ElSelect>
                </ElFormItem>

                <ElFormItem label="关注人/参与人" prop="followerIds">
                  <ElSelect
                    v-model="taskForm.followerIds"
                    multiple
                    filterable
                    placeholder="选择关注人"
                    style="width: 100%"
                    :loading="membersLoading"
                    collapse-tags
                    :max-collapse-tags="2"
                  >
                    <ElOption
                      v-for="member in projectMembers"
                      :key="member.userId"
                      :label="member.nickname || member.username"
                      :value="member.userId"
                      :disabled="taskForm.assigneeIds.includes(member.userId)"
                    >
                      <div class="assignee-option">
                        <ElAvatar :size="24" :src="member.avatar">
                          {{ (member.nickname || member.username)?.charAt(0) }}
                        </ElAvatar>
                        <span class="assignee-name">{{ member.nickname || member.username }}</span>
                      </div>
                    </ElOption>
                  </ElSelect>
                </ElFormItem>

                <div class="task-summary-panel">
                  <div class="summary-item">
                    <span class="summary-label">子任务</span>
                    <strong>{{ subTaskProgress }}%</strong>
                    <small>{{ subTaskCompletedCount }}/{{ subTasks.length }}</small>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">评论</span>
                    <strong>{{ commentList.length }}</strong>
                    <small>条</small>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">附件</span>
                    <strong>{{ attachments.length }}</strong>
                    <small>个</small>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">参与</span>
                    <strong>{{ taskParticipantCount }}</strong>
                    <small>人</small>
                  </div>
                </div>

                <div class="attachment-section">
                  <div class="section-header">
                    <span class="section-title">
                      <ArtSvgIcon icon="ri:attachment-2" />
                      附件
                    </span>
                    <ElUpload
                      :show-file-list="false"
                      :http-request="handleUploadAttachment"
                      :disabled="attachmentUploading"
                    >
                      <ElButton size="small" type="primary" plain :loading="attachmentUploading">
                        <ArtSvgIcon icon="ri:upload-cloud-2-line" />
                        上传
                      </ElButton>
                    </ElUpload>
                  </div>

                  <div class="attachment-list" v-loading="attachmentsLoading">
                    <div v-for="file in attachments" :key="file.id" class="attachment-item">
                      <ArtSvgIcon :icon="getFileIcon(file)" class="attachment-icon" />
                      <div class="attachment-info">
                        <span class="attachment-name">{{ file.name }}</span>
                        <span class="attachment-meta">{{ formatAttachmentMeta(file) }}</span>
                      </div>
                      <ElButton
                        :icon="Download"
                        size="small"
                        text
                        @click="handleDownloadAttachment(file)"
                      />
                      <ElButton
                        :icon="Delete"
                        size="small"
                        text
                        type="danger"
                        @click="handleDeleteAttachment(file)"
                      />
                    </div>
                    <div
                      v-if="attachments.length === 0 && !attachmentsLoading"
                      class="attachment-empty"
                    >
                      暂无附件
                    </div>
                  </div>
                </div>

                <!-- 子任务 -->
                <div class="subtask-section">
                  <div class="subtask-header">
                    <span class="subtask-title">
                      <ArtSvgIcon icon="ri:checkbox-multiple-line" />
                      子任务
                    </span>
                    <span class="subtask-progress-text">
                      {{ subTaskCompletedCount }} / {{ subTasks.length }}
                    </span>
                  </div>

                  <ElProgress
                    v-if="subTasks.length > 0"
                    :percentage="subTaskProgress"
                    :stroke-width="6"
                    :show-text="false"
                    class="subtask-progress-bar"
                  />

                  <div class="subtask-list" v-loading="subTasksLoading">
                    <div
                      v-for="subTask in subTasks"
                      :key="subTask.id"
                      class="subtask-item"
                      :class="{
                        'status-pending': subTask.status === 0,
                        'status-progress': subTask.status === 2,
                        'status-completed': subTask.status === 1
                      }"
                    >
                      <ElSelect
                        :model-value="subTask.status"
                        @change="(val) => handleChangeSubTaskStatus(subTask, Number(val))"
                        class="subtask-status-select"
                        size="small"
                      >
                        <ElOption :value="0" label="未开始">
                          <span class="status-option">
                            <span class="status-dot status-pending"></span>
                            未开始
                          </span>
                        </ElOption>
                        <ElOption :value="2" label="处理中">
                          <span class="status-option">
                            <span class="status-dot status-progress"></span>
                            处理中
                          </span>
                        </ElOption>
                        <ElOption :value="1" label="已完成">
                          <span class="status-option">
                            <span class="status-dot status-completed"></span>
                            已完成
                          </span>
                        </ElOption>
                      </ElSelect>
                      <span
                        class="subtask-content"
                        :class="{ 'line-through': subTask.status === 1 }"
                      >
                        {{ subTask.content }}
                      </span>
                      <ElButton
                        class="subtask-delete-btn"
                        :icon="Delete"
                        size="small"
                        text
                        type="danger"
                        @click="handleDeleteSubTask(subTask)"
                      />
                    </div>

                    <div v-if="subTasks.length === 0 && !subTasksLoading" class="subtask-empty">
                      暂无子任务
                    </div>
                  </div>

                  <div class="subtask-add">
                    <ElInput
                      v-model="newSubTaskContent"
                      placeholder="添加子任务..."
                      size="small"
                      :disabled="addingSubTask"
                      @keyup.enter="handleAddSubTask"
                    >
                      <template #prefix>
                        <ArtSvgIcon icon="ri:add-line" />
                      </template>
                    </ElInput>
                    <ElButton
                      type="primary"
                      size="small"
                      :loading="addingSubTask"
                      :disabled="!newSubTaskContent.trim()"
                      @click="handleAddSubTask"
                    >
                      添加
                    </ElButton>
                  </div>
                </div>
              </ElForm>
            </div>
          </ElScrollbar>
        </ElTabPane>

        <ElTabPane name="activity">
          <template #label>
            <span
              >动态 <ElBadge :value="activities.length" :max="99" v-if="activities.length > 0"
            /></span>
          </template>
          <ElScrollbar height="calc(100vh - 200px)">
            <div class="mobile-activity-wrapper">
              <!-- 评论输入框 -->
              <div class="comment-input mobile">
                <ElInput
                  v-model="commentContent"
                  type="textarea"
                  placeholder="发表评论..."
                  :rows="2"
                  maxlength="500"
                  resize="none"
                />
                <ElButton
                  type="primary"
                  size="small"
                  :loading="commentLoading"
                  :disabled="!commentContent.trim()"
                  @click="handleAddComment"
                >
                  <ArtSvgIcon icon="ri:send-plane-line" />
                </ElButton>
              </div>

              <!-- 活动类型筛选 -->
              <div class="activity-filter">
                <ElRadioGroup v-model="activeTab" size="small">
                  <ElRadioButton label="all">全部</ElRadioButton>
                  <ElRadioButton label="comments">评论</ElRadioButton>
                  <ElRadioButton label="logs">日志</ElRadioButton>
                </ElRadioGroup>
              </div>

              <!-- 活动列表 -->
              <div class="activity-list-wrapper" v-loading="activityLoading">
                <div
                  v-if="currentActivityList.length === 0 && !activityLoading"
                  class="empty-activity"
                >
                  <ArtSvgIcon icon="ri:file-list-3-line" />
                  <span>{{ emptyText }}</span>
                </div>

                <ElTimeline v-else class="compact-timeline">
                  <ElTimelineItem
                    v-for="activity in currentActivityList"
                    :key="`${activity.type}-${activity.id}`"
                    :type="getTimelineType(activity)"
                    :hollow="activity.type === 'log'"
                    :size="activity.type === 'log' ? 'normal' : 'large'"
                  >
                    <div class="activity-item" :class="activity.type">
                      <template v-if="activity.type === 'comment'">
                        <div class="comment-header">
                          <ElAvatar :size="20" :src="activity.avatar">
                            {{ activity.nickname?.charAt(0) || activity.username?.charAt(0) }}
                          </ElAvatar>
                          <span class="user-name">{{
                            activity.nickname || activity.username
                          }}</span>
                          <span class="activity-time">{{ formatTime(activity.createdAt) }}</span>
                        </div>
                        <div class="comment-body">{{ activity.content }}</div>
                      </template>

                      <template v-else>
                        <div class="log-item">
                          <span class="log-user">{{ activity.nickname || activity.username }}</span>
                          <span class="log-text">{{ activity.content }}</span>
                          <span class="log-time">{{ formatTime(activity.createdAt) }}</span>
                        </div>
                      </template>
                    </div>
                  </ElTimelineItem>
                </ElTimeline>
              </div>
            </div>
          </ElScrollbar>
        </ElTabPane>
      </ElTabs>
    </div>

    <!-- PC 端 / 新建模式：保持原有布局 -->
    <div v-else :class="['dialog-content', { 'two-column': isEditMode }]">
      <!-- 左侧：任务表单 -->
      <div class="form-section">
        <ElScrollbar :height="isEditMode ? '600px' : 'auto'">
          <div class="form-inner">
            <ElForm
              ref="formRef"
              :model="taskForm"
              :rules="formRules"
              label-width="80px"
              label-position="top"
            >
              <ElFormItem label="任务标题" prop="title">
                <ElInput
                  v-model="taskForm.title"
                  placeholder="请输入任务标题"
                  maxlength="200"
                  show-word-limit
                />
              </ElFormItem>

              <ElFormItem label="任务描述" prop="description">
                <ElInput
                  v-model="taskForm.description"
                  type="textarea"
                  placeholder="请输入任务描述（选填）"
                  :rows="isEditMode ? 6 : 4"
                  maxlength="1000"
                  show-word-limit
                />
              </ElFormItem>

              <ElFormItem label="优先级" prop="priority">
                <ElSelect
                  v-model="taskForm.priority"
                  placeholder="选择优先级"
                  style="width: 100%"
                >
                  <ElOption
                    v-for="item in priorityOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                    <div class="priority-option">
                      <span class="priority-dot" :class="getPriorityClass(item.value)"></span>
                      <span>{{ item.label }}</span>
                    </div>
                  </ElOption>
                </ElSelect>
              </ElFormItem>

              <ElRow :gutter="12" class="task-time-row">
                <ElCol :span="12">
                  <ElFormItem label="开始时间" prop="startTime">
                    <ElDatePicker
                      v-model="taskForm.startTime"
                      type="datetime"
                      placeholder="开始时间"
                      format="YYYY-MM-DD HH:mm"
                      value-format="YYYY-MM-DDTHH:mm:ss"
                      style="width: 100%"
                    />
                  </ElFormItem>
                </ElCol>
                <ElCol :span="12">
                  <ElFormItem label="截止时间" prop="dueTime">
                    <ElDatePicker
                      v-model="taskForm.dueTime"
                      type="datetime"
                      placeholder="截止时间"
                      format="YYYY-MM-DD HH:mm"
                      value-format="YYYY-MM-DDTHH:mm:ss"
                      style="width: 100%"
                    />
                  </ElFormItem>
                </ElCol>
              </ElRow>

              <!-- 负责人选择 -->
              <ElFormItem label="负责人" prop="assigneeIds">
                <ElSelect
                  v-model="taskForm.assigneeIds"
                  multiple
                  filterable
                  placeholder="选择负责人"
                  style="width: 100%"
                  :loading="membersLoading"
                  collapse-tags
                  collapse-tags-tooltip
                  :max-collapse-tags="3"
                >
                  <ElOption
                    v-for="member in projectMembers"
                    :key="member.userId"
                    :label="member.nickname || member.username"
                    :value="member.userId"
                  >
                    <div class="assignee-option">
                      <ElAvatar :size="24" :src="member.avatar">
                        {{ (member.nickname || member.username)?.charAt(0) }}
                      </ElAvatar>
                      <span class="assignee-name">{{ member.nickname || member.username }}</span>
                      <ElTag v-if="member.role === 'admin'" size="small" type="warning"
                        >管理员</ElTag
                      >
                    </div>
                  </ElOption>
                </ElSelect>
              </ElFormItem>

              <ElFormItem label="关注人/参与人" prop="followerIds">
                <ElSelect
                  v-model="taskForm.followerIds"
                  multiple
                  filterable
                  placeholder="选择关注人"
                  style="width: 100%"
                  :loading="membersLoading"
                  collapse-tags
                  collapse-tags-tooltip
                  :max-collapse-tags="3"
                >
                  <ElOption
                    v-for="member in projectMembers"
                    :key="member.userId"
                    :label="member.nickname || member.username"
                    :value="member.userId"
                    :disabled="taskForm.assigneeIds.includes(member.userId)"
                  >
                    <div class="assignee-option">
                      <ElAvatar :size="24" :src="member.avatar">
                        {{ (member.nickname || member.username)?.charAt(0) }}
                      </ElAvatar>
                      <span class="assignee-name">{{ member.nickname || member.username }}</span>
                      <ElTag v-if="taskForm.assigneeIds.includes(member.userId)" size="small">
                        负责人
                      </ElTag>
                    </div>
                  </ElOption>
                </ElSelect>
              </ElFormItem>
            </ElForm>

            <!-- 任务动态（仅编辑模式显示，位于左下角） -->
            <div v-if="isEditMode" class="activity-section-bottom">
              <!-- Tabs 切换 -->
              <ElTabs v-model="activeTab" class="activity-tabs">
                <ElTabPane name="all">
                  <template #label>
                    <span class="tab-label">
                      <ArtSvgIcon icon="ri:list-unordered" />
                      全部
                      <ElBadge :value="activities.length" :max="99" v-if="activities.length > 0" />
                    </span>
                  </template>
                </ElTabPane>
                <ElTabPane name="comments">
                  <template #label>
                    <span class="tab-label">
                      <ArtSvgIcon icon="ri:chat-3-line" />
                      评论
                      <ElBadge
                        :value="commentList.length"
                        :max="99"
                        v-if="commentList.length > 0"
                      />
                    </span>
                  </template>
                </ElTabPane>
                <ElTabPane name="logs">
                  <template #label>
                    <span class="tab-label">
                      <ArtSvgIcon icon="ri:history-line" />
                      日志
                      <ElBadge :value="logList.length" :max="99" v-if="logList.length > 0" />
                    </span>
                  </template>
                </ElTabPane>
              </ElTabs>

              <!-- 评论输入框 -->
              <div class="comment-input">
                <ElInput
                  v-model="commentContent"
                  type="textarea"
                  placeholder="发表评论... (Ctrl+Enter 发送)"
                  :rows="2"
                  maxlength="500"
                  resize="none"
                  @keydown.meta.enter="handleAddComment"
                  @keydown.ctrl.enter="handleAddComment"
                />
                <ElButton
                  type="primary"
                  size="small"
                  :loading="commentLoading"
                  :disabled="!commentContent.trim()"
                  @click="handleAddComment"
                >
                  <ArtSvgIcon icon="ri:send-plane-line" />
                  发送
                </ElButton>
              </div>

              <!-- 活动列表（固定高度滚动） -->
              <div class="activity-list-wrapper" v-loading="activityLoading">
                <ElScrollbar height="300px">
                  <div
                    v-if="currentActivityList.length === 0 && !activityLoading"
                    class="empty-activity"
                  >
                    <ArtSvgIcon icon="ri:file-list-3-line" />
                    <span>{{ emptyText }}</span>
                  </div>

                  <ElTimeline v-else class="compact-timeline">
                    <ElTimelineItem
                      v-for="activity in currentActivityList"
                      :key="`${activity.type}-${activity.id}`"
                      :type="getTimelineType(activity)"
                      :hollow="activity.type === 'log'"
                      :size="activity.type === 'log' ? 'normal' : 'large'"
                    >
                      <div class="activity-item" :class="activity.type">
                        <!-- 评论类型 -->
                        <template v-if="activity.type === 'comment'">
                          <div class="comment-header">
                            <ElAvatar :size="24" :src="activity.avatar">
                              {{ activity.nickname?.charAt(0) || activity.username?.charAt(0) }}
                            </ElAvatar>
                            <span class="user-name">{{
                              activity.nickname || activity.username
                            }}</span>
                            <span class="activity-time">{{ formatTime(activity.createdAt) }}</span>
                          </div>
                          <div class="comment-body">{{ activity.content }}</div>
                        </template>

                        <!-- 日志类型 -->
                        <template v-else>
                          <div class="log-item">
                            <span class="log-user">{{
                              activity.nickname || activity.username
                            }}</span>
                            <span class="log-text">{{ activity.content }}</span>
                            <span class="log-time">{{ formatTime(activity.createdAt) }}</span>
                          </div>
                        </template>
                      </div>
                    </ElTimelineItem>
                  </ElTimeline>
                </ElScrollbar>
              </div>
            </div>
          </div>
        </ElScrollbar>
      </div>

      <!-- 右侧：子任务栏（仅编辑模式显示） -->
      <div v-if="isEditMode" class="subtask-section-right">
        <div class="task-summary-panel">
          <div class="summary-item">
            <span class="summary-label">子任务</span>
            <strong>{{ subTaskProgress }}%</strong>
            <small>{{ subTaskCompletedCount }}/{{ subTasks.length }}</small>
          </div>
          <div class="summary-item">
            <span class="summary-label">评论</span>
            <strong>{{ commentList.length }}</strong>
            <small>条</small>
          </div>
          <div class="summary-item">
            <span class="summary-label">附件</span>
            <strong>{{ attachments.length }}</strong>
            <small>个</small>
          </div>
          <div class="summary-item">
            <span class="summary-label">参与</span>
            <strong>{{ taskParticipantCount }}</strong>
            <small>人</small>
          </div>
        </div>

        <div class="attachment-section">
          <div class="section-header">
            <span class="section-title">
              <ArtSvgIcon icon="ri:attachment-2" />
              附件
            </span>
            <ElUpload
              :show-file-list="false"
              :http-request="handleUploadAttachment"
              :disabled="attachmentUploading"
            >
              <ElButton size="small" type="primary" plain :loading="attachmentUploading">
                <ArtSvgIcon icon="ri:upload-cloud-2-line" />
                上传
              </ElButton>
            </ElUpload>
          </div>

          <div class="attachment-list" v-loading="attachmentsLoading">
            <ElScrollbar max-height="150px">
              <div v-for="file in attachments" :key="file.id" class="attachment-item">
                <ArtSvgIcon :icon="getFileIcon(file)" class="attachment-icon" />
                <div class="attachment-info">
                  <span class="attachment-name">{{ file.name }}</span>
                  <span class="attachment-meta">{{ formatAttachmentMeta(file) }}</span>
                </div>
                <ElButton
                  :icon="Download"
                  size="small"
                  text
                  @click="handleDownloadAttachment(file)"
                />
                <ElButton
                  :icon="Delete"
                  size="small"
                  text
                  type="danger"
                  @click="handleDeleteAttachment(file)"
                />
              </div>
              <div v-if="attachments.length === 0 && !attachmentsLoading" class="attachment-empty">
                暂无附件
              </div>
            </ElScrollbar>
          </div>
        </div>

        <div class="subtask-header">
          <span class="subtask-title">
            <ArtSvgIcon icon="ri:checkbox-multiple-line" />
            子任务
          </span>
          <span class="subtask-progress-text">
            {{ subTaskCompletedCount }} / {{ subTasks.length }}
          </span>
        </div>

        <!-- 进度条 -->
        <ElProgress
          v-if="subTasks.length > 0"
          :percentage="subTaskProgress"
          :stroke-width="8"
          :show-text="false"
          class="subtask-progress-bar"
        />

        <!-- 子任务列表 -->
        <div class="subtask-list" v-loading="subTasksLoading">
          <ElScrollbar height="100%">
            <div
              v-for="subTask in subTasks"
              :key="subTask.id"
              class="subtask-item"
              :class="{
                'status-pending': subTask.status === 0,
                'status-progress': subTask.status === 2,
                'status-completed': subTask.status === 1
              }"
            >
              <div class="subtask-main">
                <ElSelect
                  :model-value="subTask.status"
                  @change="(val) => handleChangeSubTaskStatus(subTask, Number(val))"
                  class="subtask-status-select"
                  size="small"
                >
                  <ElOption :value="0" label="未开始">
                    <span class="status-option">
                      <span class="status-dot status-pending"></span>
                      未开始
                    </span>
                  </ElOption>
                  <ElOption :value="2" label="处理中">
                    <span class="status-option">
                      <span class="status-dot status-progress"></span>
                      处理中
                    </span>
                  </ElOption>
                  <ElOption :value="1" label="已完成">
                    <span class="status-option">
                      <span class="status-dot status-completed"></span>
                      已完成
                    </span>
                  </ElOption>
                </ElSelect>
                <span class="subtask-content" :class="{ 'line-through': subTask.status === 1 }">
                  {{ subTask.content }}
                </span>
              </div>
              <div class="subtask-meta">
                <!-- 截止时间 -->
                <div v-if="subTask.dueTime" class="subtask-due-time">
                  <ArtSvgIcon icon="ri:time-line" />
                  <span :class="{ overdue: isSubTaskOverdue(subTask) }">{{
                    formatSubTaskDueTime(subTask.dueTime)
                  }}</span>
                </div>
                <!-- 编辑截止时间按钮 -->
                <ElButton
                  class="subtask-due-time-btn"
                  :icon="Edit"
                  size="small"
                  text
                  type="primary"
                  @click="handleEditSubTaskDueTime(subTask)"
                />
                <ElButton
                  class="subtask-delete-btn"
                  :icon="Delete"
                  size="small"
                  text
                  type="danger"
                  @click="handleDeleteSubTask(subTask)"
                />
              </div>
            </div>

            <!-- 空状态 -->
            <div v-if="subTasks.length === 0 && !subTasksLoading" class="subtask-empty">
              暂无子任务
            </div>
          </ElScrollbar>
        </div>

        <!-- 添加子任务输入框 -->
        <div class="subtask-add">
          <ElInput
            v-model="newSubTaskContent"
            placeholder="添加子任务..."
            size="small"
            :disabled="addingSubTask"
            @keyup.enter="handleAddSubTask"
          >
            <template #prefix>
              <ArtSvgIcon icon="ri:add-line" />
            </template>
          </ElInput>
          <ElButton
            type="primary"
            size="small"
            :loading="addingSubTask"
            :disabled="!newSubTaskContent.trim()"
            @click="handleAddSubTask"
          >
            添加
          </ElButton>
        </div>
      </div>
    </div>

    <!-- 编辑子任务截止时间对话框 -->
    <ElDialog
      v-model="subTaskDueTimeDialogVisible"
      title="设置截止时间"
      width="400px"
      @close="subTaskDueTimeValue = ''"
    >
      <div style="margin-bottom: 12px">
        <ElDatePicker
          v-model="subTaskDueTimeValue"
          type="datetime"
          placeholder="选择截止时间（留空则清除）"
          format="YYYY-MM-DD HH:mm"
          value-format="YYYY-MM-DDTHH:mm:ss"
          style="width: 100%"
          clearable
        />
      </div>
      <template #footer>
        <ElButton @click="subTaskDueTimeDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSaveSubTaskDueTime">确定</ElButton>
      </template>
    </ElDialog>

    <template #footer>
      <div class="dialog-footer" :class="{ 'is-edit-mode': isEditMode }">
        <!-- 删除按钮（仅编辑模式显示） -->
        <ElButton
          v-if="isEditMode"
          type="danger"
          plain
          @click="handleDelete"
          :loading="deleteLoading"
        >
          <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" />
          删除
        </ElButton>
        <div class="footer-right">
          <ElButton @click="visible = false">取消</ElButton>
          <!-- 提交并继续按钮（仅新建模式显示） -->
          <ElButton
            v-if="!isEditMode"
            type="success"
            @click="handleSubmitAndContinue"
            :loading="submitContinueLoading"
          >
            <ArtSvgIcon icon="ri:add-circle-line" class="mr-1" />
            提交并继续
          </ElButton>
          <!-- 提交并保留按钮（仅新建模式显示） -->
          <ElButton
            v-if="!isEditMode"
            type="warning"
            @click="handleSubmitAndKeep"
            :loading="submitKeepLoading"
          >
            <ArtSvgIcon icon="ri:file-copy-line" class="mr-1" />
            提交并保留
          </ElButton>
          <ElButton type="primary" @click="handleSubmit" :loading="submitLoading">
            {{ isEditMode ? '保存' : '创建' }}
          </ElButton>
        </div>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ref, reactive, computed } from 'vue'
  import {
    ElMessage,
    ElMessageBox,
    type FormInstance,
    type FormRules,
    type UploadRequestOptions
  } from 'element-plus'
  import { Delete, Download, Edit } from '@element-plus/icons-vue'
  import { createTask, updateTask, deleteTask, type BoardTask } from '@/api/board'
  import { getTaskActivities, addComment, type Activity } from '@/api/activity'
  import { getProjectMembers, type Member } from '@/api/member'
  import {
    fetchTaskFiles,
    uploadTaskFile,
    downloadFile,
    deleteFileNode,
    type FileNode
  } from '@/api/file'
  import {
    getSubTasks,
    createSubTask,
    updateSubTask,
    deleteSubTask,
    type SubTask
  } from '@/api/subtask'

  const props = defineProps<{
    projectId: number
  }>()

  const visible = defineModel<boolean>('visible', { default: false })

  const emit = defineEmits<{
    (e: 'success'): void
    (e: 'subtask-updated', taskId: number): void
  }>()

  // 移动端检测
  const isMobile = useMediaQuery('(max-width: 768px)')
  const mobileActiveTab = ref('detail')

  // 弹窗宽度（响应式）
  const dialogWidth = computed(() => {
    if (isMobile.value) return '100%'
    return isEditMode.value ? '960px' : '480px'
  })

  // 表单相关
  const formRef = ref<FormInstance>()
  const isEditMode = ref(false)
  const currentTaskId = ref<number | null>(null)
  const currentStageId = ref<number | null>(null)
  const submitLoading = ref(false)
  const submitContinueLoading = ref(false)
  const submitKeepLoading = ref(false)
  const deleteLoading = ref(false)

  // 任务表单
  const taskForm = reactive({
    title: '',
    description: '',
    priority: 1,
    startTime: '',
    dueTime: '',
    assigneeIds: [] as number[],
    followerIds: [] as number[]
  })

  // 项目成员（用于负责人选择）
  const projectMembers = ref<Member[]>([])
  const membersLoading = ref(false)

  // 活动流相关
  const activities = ref<Activity[]>([])
  const activityLoading = ref(false)
  const commentContent = ref('')
  const commentLoading = ref(false)
  const activeTab = ref('all')

  // 子任务相关
  const subTasks = ref<SubTask[]>([])
  const subTasksLoading = ref(false)
  const newSubTaskContent = ref('')
  const addingSubTask = ref(false)
  const editingSubTaskDueTime = ref<SubTask | null>(null)
  const subTaskDueTimeDialogVisible = ref(false)
  const subTaskDueTimeValue = ref('')

  // 附件相关
  const attachments = ref<FileNode[]>([])
  const attachmentsLoading = ref(false)
  const attachmentUploading = ref(false)

  // 计算属性：过滤后的列表
  const commentList = computed(() => activities.value.filter((a) => a.type === 'comment'))
  const logList = computed(() => activities.value.filter((a) => a.type === 'log'))
  const currentActivityList = computed(() => {
    switch (activeTab.value) {
      case 'comments':
        return commentList.value
      case 'logs':
        return logList.value
      default:
        return activities.value
    }
  })
  const emptyText = computed(() => {
    switch (activeTab.value) {
      case 'comments':
        return '暂无评论'
      case 'logs':
        return '暂无日志'
      default:
        return '暂无动态'
    }
  })

  // 子任务进度计算
  const subTaskProgress = computed(() => {
    if (subTasks.value.length === 0) return 0
    const completed = subTasks.value.filter((s) => s.status === 1).length
    return Math.round((completed / subTasks.value.length) * 100)
  })
  const subTaskCompletedCount = computed(() => subTasks.value.filter((s) => s.status === 1).length)
  const taskParticipantCount = computed(() => {
    const ids = new Set<number>()
    taskForm.assigneeIds.forEach((id) => ids.add(id))
    taskForm.followerIds.forEach((id) => ids.add(id))
    return ids.size
  })
  const effectiveFollowerIds = computed(() =>
    taskForm.followerIds.filter((id) => !taskForm.assigneeIds.includes(id))
  )

  const validateTaskTimeRange = (
    _rule: unknown,
    _value: unknown,
    callback: (error?: Error) => void
  ) => {
    if (!taskForm.startTime || !taskForm.dueTime) {
      callback()
      return
    }

    const startTimestamp = new Date(taskForm.startTime).getTime()
    const dueTimestamp = new Date(taskForm.dueTime).getTime()
    if (startTimestamp >= dueTimestamp) {
      callback(new Error('开始时间必须早于截止时间'))
      return
    }
    callback()
  }

  // 表单校验规则
  const formRules: FormRules = {
    title: [
      { required: true, message: '请输入任务标题', trigger: 'blur' },
      { min: 1, max: 200, message: '标题长度在 1 到 200 个字符', trigger: 'blur' }
    ],
    startTime: [{ validator: validateTaskTimeRange, trigger: 'change' }],
    dueTime: [{ validator: validateTaskTimeRange, trigger: 'change' }]
  }

  // 优先级选项
  const priorityOptions = [
    { value: 1, label: '普通' },
    { value: 2, label: '紧急' },
    { value: 3, label: '非常紧急' }
  ]

  /**
   * 打开新建弹窗
   */
  const openCreate = (stageId: number) => {
    isEditMode.value = false
    currentTaskId.value = null
    currentStageId.value = stageId
    resetForm()
    visible.value = true
  }

  /**
   * 打开编辑弹窗
   */
  const openEdit = (task: BoardTask) => {
    isEditMode.value = true
    currentTaskId.value = task.id
    currentStageId.value = task.stageId

    // 回显数据
    taskForm.title = task.title || ''
    taskForm.description = task.description || ''
    taskForm.priority = task.priority || 1
    taskForm.startTime = task.startTime || ''
    taskForm.dueTime = task.dueTime || ''
    taskForm.assigneeIds = task.assigneeIds || []
    taskForm.followerIds = task.followerIds || []

    visible.value = true
  }

  /**
   * 弹窗打开时
   */
  const onDialogOpen = () => {
    // 获取项目成员列表（用于负责人选择）
    fetchProjectMembers()

    if (isEditMode.value && currentTaskId.value) {
      // 并发获取活动流和子任务
      fetchActivities()
      fetchSubTasks()
      fetchAttachments()
    }
  }

  /**
   * 获取项目成员列表
   */
  const fetchProjectMembers = async () => {
    if (!props.projectId) return

    membersLoading.value = true
    try {
      const data = await getProjectMembers(props.projectId)
      projectMembers.value = data || []
    } catch (error) {
      console.error('获取项目成员失败:', error)
    } finally {
      membersLoading.value = false
    }
  }

  /**
   * 弹窗关闭时
   */
  const onDialogClose = () => {
    resetForm()
    activities.value = []
    subTasks.value = []
    attachments.value = []
    newSubTaskContent.value = ''
    commentContent.value = ''
    activeTab.value = 'all'
  }

  /**
   * 重置表单
   */
  const resetForm = () => {
    taskForm.title = ''
    taskForm.description = ''
    taskForm.priority = 1
    taskForm.startTime = ''
    taskForm.dueTime = ''
    taskForm.assigneeIds = []
    taskForm.followerIds = []
    // 仅清除校验状态，不调用 resetFields()
    // resetFields() 会重置为表单挂载时的值，可能导致残留数据
    formRef.value?.clearValidate()
  }

  /**
   * 获取活动流
   */
  const fetchActivities = async () => {
    if (!currentTaskId.value) return

    activityLoading.value = true
    try {
      const data = await getTaskActivities(currentTaskId.value)
      activities.value = data || []
    } catch (error) {
      console.error('获取活动流失败:', error)
    } finally {
      activityLoading.value = false
    }
  }

  /**
   * 获取子任务列表
   */
  const fetchSubTasks = async () => {
    if (!currentTaskId.value) return

    subTasksLoading.value = true
    try {
      const data = await getSubTasks(currentTaskId.value)
      subTasks.value = data || []
    } catch (error) {
      console.error('获取子任务失败:', error)
    } finally {
      subTasksLoading.value = false
    }
  }

  /**
   * 获取任务附件列表
   */
  const fetchAttachments = async () => {
    if (!currentTaskId.value) return

    attachmentsLoading.value = true
    try {
      const data = await fetchTaskFiles(currentTaskId.value)
      attachments.value = data || []
    } catch (error) {
      const statusCode = (error as { code?: number })?.code
      attachments.value = []
      if (statusCode === 404) {
        console.warn('任务附件接口不可用，请确认后端已部署附件接口:', error)
      } else {
        console.error('获取任务附件失败:', error)
        ElMessage.error('获取任务附件失败')
      }
    } finally {
      attachmentsLoading.value = false
    }
  }

  const refreshActivitiesSoon = () => {
    window.setTimeout(() => {
      fetchActivities()
    }, 250)
  }

  /**
   * 添加子任务
   */
  const handleAddSubTask = async () => {
    if (!currentTaskId.value || !newSubTaskContent.value.trim()) return

    addingSubTask.value = true
    try {
      const newSubTask = await createSubTask(currentTaskId.value, newSubTaskContent.value.trim())
      subTasks.value.push(newSubTask)
      newSubTaskContent.value = ''
      // 通知父组件更新子任务缓存
      if (currentTaskId.value) {
        emit('subtask-updated', currentTaskId.value)
      }
      refreshActivitiesSoon()
    } catch (error) {
      console.error('添加子任务失败:', error)
      ElMessage.error('添加子任务失败')
    } finally {
      addingSubTask.value = false
    }
  }

  /**
   * 切换子任务状态
   */
  const handleChangeSubTaskStatus = async (subTask: SubTask, newStatus: number) => {
    try {
      await updateSubTask(subTask.id, { status: newStatus })
      subTask.status = newStatus
      const statusText = newStatus === 0 ? '未开始' : newStatus === 1 ? '已完成' : '处理中'
      ElMessage.success(`子任务状态已更新为：${statusText}`)
      // 通知父组件更新子任务缓存
      if (currentTaskId.value) {
        emit('subtask-updated', currentTaskId.value)
      }
      refreshActivitiesSoon()
    } catch (error) {
      console.error('更新子任务状态失败:', error)
      ElMessage.error('更新状态失败')
    }
  }

  /**
   * 切换子任务状态（已废弃，使用 handleChangeSubTaskStatus）
   * @deprecated 使用 handleChangeSubTaskStatus 代替
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleToggleSubTask = async (subTask: SubTask) => {
    await handleChangeSubTaskStatus(subTask, subTask.status === 1 ? 0 : 1)
  }

  /**
   * 删除子任务
   */
  const handleDeleteSubTask = async (subTask: SubTask) => {
    try {
      await deleteSubTask(subTask.id)
      const index = subTasks.value.findIndex((s) => s.id === subTask.id)
      if (index > -1) {
        subTasks.value.splice(index, 1)
      }
      // 通知父组件更新子任务缓存
      if (currentTaskId.value) {
        emit('subtask-updated', currentTaskId.value)
      }
      refreshActivitiesSoon()
    } catch (error) {
      console.error('删除子任务失败:', error)
      ElMessage.error('删除子任务失败')
    }
  }

  /**
   * 编辑子任务截止时间
   */
  const handleEditSubTaskDueTime = (subTask: SubTask) => {
    editingSubTaskDueTime.value = subTask
    subTaskDueTimeValue.value = subTask.dueTime || ''
    subTaskDueTimeDialogVisible.value = true
  }

  /**
   * 保存子任务截止时间
   */
  const handleSaveSubTaskDueTime = async () => {
    if (!editingSubTaskDueTime.value) return

    try {
      // 如果为空，则清除截止时间；否则处理截止时间，统一设置为选定日期的 18:00:00
      const normalizedDueTime = subTaskDueTimeValue.value
        ? normalizeDateTime(subTaskDueTimeValue.value)
        : undefined

      await updateSubTask(editingSubTaskDueTime.value.id, {
        dueTime: normalizedDueTime || null,
        clearDueTime: !normalizedDueTime
      })

      // 更新本地数据
      const subTask = subTasks.value.find((s) => s.id === editingSubTaskDueTime.value!.id)
      if (subTask) {
        subTask.dueTime = normalizedDueTime || undefined
      }

      subTaskDueTimeDialogVisible.value = false
      editingSubTaskDueTime.value = null
      subTaskDueTimeValue.value = ''
      ElMessage.success('截止时间已更新')
      // 通知父组件更新子任务缓存（虽然截止时间不影响进度，但保持数据同步）
      if (currentTaskId.value) {
        emit('subtask-updated', currentTaskId.value)
      }
      refreshActivitiesSoon()
    } catch (error) {
      console.error('更新子任务截止时间失败:', error)
      ElMessage.error('更新截止时间失败')
    }
  }

  /**
   * 格式化子任务截止时间
   */
  const formatSubTaskDueTime = (dueTime: string): string => {
    if (!dueTime) return ''
    const date = new Date(dueTime)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const dueDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    if (dueDate.getTime() === today.getTime()) {
      return '今天 18:00'
    } else if (dueDate.getTime() === today.getTime() + 86400000) {
      return '明天 18:00'
    } else {
      return date.toLocaleDateString('zh-CN', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  /**
   * 判断子任务是否过期
   */
  const isSubTaskOverdue = (subTask: SubTask): boolean => {
    if (!subTask.dueTime || subTask.status === 1) return false
    const dueDate = new Date(subTask.dueTime)
    return dueDate < new Date()
  }

  /**
   * 发表评论
   */
  const handleAddComment = async () => {
    if (!currentTaskId.value || !commentContent.value.trim()) return

    commentLoading.value = true
    try {
      const newComment = await addComment(currentTaskId.value, commentContent.value.trim())
      // 添加到列表开头（因为是倒序）
      activities.value.unshift(newComment)
      commentContent.value = ''
      ElMessage.success('评论发表成功')
      // 切换到全部或评论 Tab
      if (activeTab.value === 'logs') {
        activeTab.value = 'all'
      }
    } catch (error: any) {
      console.error('发表评论失败:', error)
    } finally {
      commentLoading.value = false
    }
  }

  /**
   * 上传任务附件
   */
  const handleUploadAttachment = async (options: UploadRequestOptions) => {
    if (!currentTaskId.value) return

    attachmentUploading.value = true
    try {
      const fileNode = await uploadTaskFile(options.file as File, currentTaskId.value)
      attachments.value.unshift(fileNode)
      options.onSuccess?.(fileNode)
      refreshActivitiesSoon()
    } catch (error: any) {
      console.error('上传附件失败:', error)
      options.onError?.(error)
    } finally {
      attachmentUploading.value = false
    }
  }

  /**
   * 下载任务附件
   */
  const handleDownloadAttachment = async (file: FileNode) => {
    try {
      await downloadFile(file.id, file.name)
    } catch (error) {
      console.error('下载附件失败:', error)
      ElMessage.error('下载附件失败')
    }
  }

  /**
   * 删除任务附件
   */
  const handleDeleteAttachment = async (file: FileNode) => {
    try {
      await ElMessageBox.confirm(`确定删除附件「${file.name}」吗？`, '删除确认', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      })

      await deleteFileNode(file.id)
      attachments.value = attachments.value.filter((item) => item.id !== file.id)
      refreshActivitiesSoon()
    } catch (error: any) {
      if (error !== 'cancel') {
        console.error('删除附件失败:', error)
        ElMessage.error('删除附件失败')
      }
    }
  }

  const normalizeDateTime = (dateTime: string | undefined): string | undefined => {
    if (!dateTime) return undefined
    const date = new Date(dateTime)
    if (isNaN(date.getTime())) return undefined
    return dateTime
  }

  /**
   * 提交表单（创建/更新）
   */
  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (!valid) return

      submitLoading.value = true
      try {
        const normalizedStartTime = normalizeDateTime(taskForm.startTime)
        const normalizedDueTime = normalizeDateTime(taskForm.dueTime)

        if (isEditMode.value && currentTaskId.value) {
          // 更新任务
          await updateTask(currentTaskId.value, {
            title: taskForm.title.trim(),
            description: taskForm.description?.trim() || '',
            priority: taskForm.priority,
            startTime: normalizedStartTime,
            clearStartTime: !normalizedStartTime,
            dueTime: normalizedDueTime,
            clearDueTime: !normalizedDueTime,
            assigneeIds: taskForm.assigneeIds,
            followerIds: effectiveFollowerIds.value
          })
          ElMessage.success('任务更新成功')
          // 刷新活动流
          fetchActivities()
        } else {
          // 创建任务
          await createTask({
            projectId: props.projectId,
            stageId: currentStageId.value!,
            title: taskForm.title.trim(),
            description: taskForm.description?.trim() || '',
            priority: taskForm.priority,
            startTime: normalizedStartTime,
            dueTime: normalizedDueTime,
            assigneeIds: taskForm.assigneeIds.length > 0 ? taskForm.assigneeIds : undefined,
            followerIds:
              effectiveFollowerIds.value.length > 0 ? effectiveFollowerIds.value : undefined
          })
          ElMessage.success('任务创建成功')
          visible.value = false
          resetForm()
        }

        emit('success')
      } catch (error: any) {
        console.error('操作失败:', error)
      } finally {
        submitLoading.value = false
      }
    })
  }

  /**
   * 提交并继续创建（仅新建模式）
   * - 创建成功后不关闭弹窗
   * - 清空 title, description
   * - 保留 priority、assigneeIds 和任务时间（方便批量录入）
   */
  const handleSubmitAndContinue = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (!valid) return

      submitContinueLoading.value = true
      try {
        const normalizedStartTime = normalizeDateTime(taskForm.startTime)
        const normalizedDueTime = normalizeDateTime(taskForm.dueTime)

        await createTask({
          projectId: props.projectId,
          stageId: currentStageId.value!,
          title: taskForm.title.trim(),
          description: taskForm.description?.trim() || '',
          priority: taskForm.priority,
          startTime: normalizedStartTime,
          dueTime: normalizedDueTime,
          assigneeIds: taskForm.assigneeIds.length > 0 ? taskForm.assigneeIds : undefined,
          followerIds:
            effectiveFollowerIds.value.length > 0 ? effectiveFollowerIds.value : undefined
        })

        ElMessage.success('创建成功，可继续添加')

        // 清空 title 和 description，保留其他字段
        taskForm.title = ''
        taskForm.description = ''
        // priority、assigneeIds 和任务时间保留不变

        // 通知父组件刷新
        emit('success')
      } catch (error: any) {
        console.error('创建任务失败:', error)
      } finally {
        submitContinueLoading.value = false
      }
    })
  }

  /**
   * 提交并保留（仅新建模式）
   * - 创建成功后不关闭弹窗
   * - 保留所有字段不变
   * - 用户可修改部分内容后再次提交
   */
  const handleSubmitAndKeep = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (!valid) return

      submitKeepLoading.value = true
      try {
        const normalizedStartTime = normalizeDateTime(taskForm.startTime)
        const normalizedDueTime = normalizeDateTime(taskForm.dueTime)

        await createTask({
          projectId: props.projectId,
          stageId: currentStageId.value!,
          title: taskForm.title.trim(),
          description: taskForm.description?.trim() || '',
          priority: taskForm.priority,
          startTime: normalizedStartTime,
          dueTime: normalizedDueTime,
          assigneeIds: taskForm.assigneeIds.length > 0 ? taskForm.assigneeIds : undefined,
          followerIds:
            effectiveFollowerIds.value.length > 0 ? effectiveFollowerIds.value : undefined
        })

        ElMessage.success('创建成功，可修改后再次提交')

        // 所有字段保留不变

        // 通知父组件刷新
        emit('success')
      } catch (error: any) {
        console.error('创建任务失败:', error)
      } finally {
        submitKeepLoading.value = false
      }
    })
  }

  /**
   * 删除任务
   */
  const handleDelete = async () => {
    if (!currentTaskId.value) return

    try {
      await ElMessageBox.confirm('确定要删除这个任务吗？此操作不可恢复。', '删除确认', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      })

      deleteLoading.value = true
      await deleteTask(currentTaskId.value)
      ElMessage.success('任务删除成功')
      visible.value = false
      resetForm()
      emit('success')
    } catch (error: any) {
      if (error !== 'cancel') {
        console.error('删除失败:', error)
      }
    } finally {
      deleteLoading.value = false
    }
  }

  /**
   * 获取优先级样式类
   */
  const getPriorityClass = (priority: number): string => {
    switch (priority) {
      case 3:
        return 'priority-critical'
      case 2:
        return 'priority-high'
      default:
        return 'priority-normal'
    }
  }

  /**
   * 获取时间线类型
   */
  type TimelineType = 'primary' | 'success' | 'warning' | 'danger' | 'info'
  const getTimelineType = (activity: Activity): TimelineType => {
    if (activity.type === 'comment') return 'primary'
    switch (activity.actionType) {
      case 'CREATE':
        return 'success'
      case 'DELETE':
        return 'danger'
      case 'MOVE':
        return 'warning'
      case 'SUBTASK':
        return 'success'
      case 'ATTACHMENT':
        return 'primary'
      default:
        return 'info'
    }
  }

  /**
   * 格式化时间
   */
  const formatTime = (dateStr: string): string => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return '刚刚'
    if (diffMins < 60) return `${diffMins}分钟前`
    if (diffHours < 24) return `${diffHours}小时前`
    if (diffDays < 7) return `${diffDays}天前`

    return date.toLocaleDateString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFileIcon = (file: FileNode): string => {
    const extension = (file.extension || '').toLowerCase()
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension)) return 'ri:image-line'
    if (['doc', 'docx'].includes(extension)) return 'ri:file-word-line'
    if (['xls', 'xlsx', 'csv'].includes(extension)) return 'ri:file-excel-line'
    if (extension === 'pdf') return 'ri:file-pdf-2-line'
    if (['zip', 'rar', '7z'].includes(extension)) return 'ri:file-zip-line'
    return 'ri:attachment-2'
  }

  const formatAttachmentMeta = (file: FileNode): string => {
    const size =
      file.fileSizeFormatted && file.fileSizeFormatted !== '-' ? file.fileSizeFormatted : ''
    const creator = file.creatorName || '未知用户'
    return size ? `${creator} · ${size}` : creator
  }

  // 暴露方法供父组件调用
  defineExpose({
    openCreate,
    openEdit
  })
</script>

<style lang="scss" scoped>
  /* === 主体布局 === */
  .dialog-content {
    &.two-column {
      display: flex;
      gap: 20px;
    }
  }

  /* === 左侧表单区域 === */
  .form-section {
    flex: 9;
    min-width: 0;
    display: flex;
    flex-direction: column;

    .form-inner {
      padding-right: 12px;
      flex: 1;
      display: flex;
      flex-direction: column;
    }
  }

  /* === 左下角活动流区域 === */
  .activity-section-bottom {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid var(--el-border-color-lighter);
    display: flex;
    flex-direction: column;
    flex: 0 0 auto;
    max-height: 400px;
  }

  /* === 右侧子任务区域 === */
  .subtask-section-right {
    flex: 11;
    display: flex;
    flex-direction: column;
    border-left: 1px solid var(--el-border-color-lighter);
    padding-left: 20px;
    min-width: 0;
    max-height: 600px;
    overflow: hidden;
  }

  /* === Tabs 样式 === */
  .activity-tabs {
    margin-bottom: 12px;

    :deep(.el-tabs__header) {
      margin-bottom: 0;
    }

    :deep(.el-tabs__nav-wrap::after) {
      height: 1px;
    }

    :deep(.el-tabs__item) {
      padding: 0 16px;
      height: 36px;
      line-height: 36px;
    }
  }

  .tab-label {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;

    :deep(.art-svg-icon) {
      font-size: 14px;
    }

    :deep(.el-badge) {
      margin-left: 2px;

      .el-badge__content {
        height: 16px;
        line-height: 16px;
        padding: 0 5px;
        font-size: 10px;
      }
    }
  }

  /* === 评论输入框 === */
  .comment-input {
    display: flex;
    gap: 8px;
    align-items: flex-end;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    :deep(.el-textarea__inner) {
      font-size: 13px;
    }

    .el-button {
      flex-shrink: 0;

      :deep(.art-svg-icon) {
        margin-right: 4px;
      }
    }
  }

  /* === 活动列表容器 === */
  .activity-list-wrapper {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  /* === 左下角活动流区域的活动列表 === */
  .activity-section-bottom {
    .activity-list-wrapper {
      flex: 1;
      min-height: 0;
      overflow: hidden;
    }
  }

  /* === 空状态 === */
  .empty-activity {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: var(--el-text-color-placeholder);

    :deep(.art-svg-icon) {
      font-size: 36px;
      margin-bottom: 8px;
      opacity: 0.6;
    }

    span {
      font-size: 13px;
    }
  }

  /* === 紧凑时间线 === */
  .compact-timeline {
    padding: 0 8px 0 2px;

    :deep(.el-timeline-item) {
      padding-bottom: 12px;

      &:last-child {
        padding-bottom: 0;
      }
    }

    :deep(.el-timeline-item__wrapper) {
      padding-left: 18px;
    }

    :deep(.el-timeline-item__node) {
      width: 10px;
      height: 10px;
      left: -1px;
    }

    :deep(.el-timeline-item__node--large) {
      width: 12px;
      height: 12px;
      left: -2px;
    }

    :deep(.el-timeline-item__tail) {
      left: 4px;
    }
  }

  /* === 活动项样式 === */
  .activity-item {
    /* 评论样式 */
    &.comment {
      .comment-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;

        .user-name {
          font-size: 13px;
          font-weight: 500;
          color: var(--el-text-color-primary);
        }

        .activity-time {
          font-size: 11px;
          color: var(--el-text-color-placeholder);
          margin-left: auto;
        }
      }

      .comment-body {
        padding: 8px 12px;
        background: var(--el-fill-color-light);
        border-radius: 6px;
        font-size: 13px;
        line-height: 1.5;
        color: var(--el-text-color-primary);
        word-break: break-word;
      }
    }

    /* 日志样式 */
    &.log {
      .log-item {
        display: flex;
        align-items: baseline;
        flex-wrap: wrap;
        gap: 4px;
        font-size: 12px;
        line-height: 1.6;
      }

      .log-user {
        color: var(--el-text-color-secondary);
        font-weight: 500;
      }

      .log-text {
        color: var(--el-text-color-placeholder);
      }

      .log-time {
        color: var(--el-text-color-placeholder);
        font-size: 11px;
        margin-left: auto;
      }
    }
  }

  /* === 弹窗底部 === */
  .dialog-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .footer-right {
      display: flex;
      gap: 8px;
    }
  }

  /* === 优先级选项 === */
  .priority-option {
    display: flex;
    align-items: center;
    gap: 8px;

    .priority-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;

      &.priority-normal {
        background: #67c23a;
      }

      &.priority-high {
        background: #e6a23c;
      }

      &.priority-critical {
        background: #f56c6c;
      }
    }
  }

  /* === 负责人选项 === */
  .assignee-option {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 0;

    .assignee-name {
      flex: 1;
      font-size: 13px;
      color: var(--el-text-color-primary);
    }

    .el-tag {
      font-size: 10px;
      height: 18px;
      line-height: 16px;
    }
  }

  /* === 协作概览 === */
  .task-summary-panel {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
    margin-bottom: 16px;
  }

  .summary-item {
    min-width: 0;
    padding: 10px 8px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;
    background: var(--el-fill-color-blank);

    .summary-label {
      display: block;
      margin-bottom: 4px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }

    strong {
      display: inline-block;
      font-size: 18px;
      line-height: 1.2;
      color: var(--el-text-color-primary);
    }

    small {
      margin-left: 4px;
      font-size: 11px;
      color: var(--el-text-color-placeholder);
    }
  }

  /* === 附件模块 === */
  .attachment-section {
    flex: 0 0 auto;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);

    :deep(.art-svg-icon) {
      font-size: 16px;
      color: var(--el-color-primary);
    }
  }

  .attachment-list {
    min-height: 42px;
  }

  .attachment-item {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 38px;
    padding: 6px 2px;
    border-radius: 4px;

    &:hover {
      background: var(--el-fill-color-light);
    }

    .attachment-icon {
      flex-shrink: 0;
      font-size: 18px;
      color: var(--el-color-primary);
    }

    .attachment-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .attachment-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 13px;
      color: var(--el-text-color-primary);
    }

    .attachment-meta {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 11px;
      color: var(--el-text-color-placeholder);
    }

    .el-button {
      flex-shrink: 0;
    }
  }

  .attachment-empty {
    padding: 12px;
    text-align: center;
    font-size: 13px;
    color: var(--el-text-color-placeholder);
  }

  /* === 工具类 === */
  .mr-1 {
    margin-right: 4px;
  }

  /* === 子任务模块（右侧） === */
  .subtask-section-right {
    .subtask-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .subtask-title {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
        font-weight: 500;
        color: var(--el-text-color-primary);

        :deep(.art-svg-icon) {
          font-size: 16px;
          color: var(--el-color-primary);
        }
      }

      .subtask-progress-text {
        font-size: 13px;
        color: var(--el-text-color-secondary);
      }
    }

    .subtask-progress-bar {
      margin-bottom: 12px;

      :deep(.el-progress-bar__outer) {
        border-radius: 4px;
      }

      :deep(.el-progress-bar__inner) {
        border-radius: 4px;
        transition: width 0.3s ease;
      }
    }

    .subtask-list {
      flex: 1 1 auto;
      min-height: 0;
      margin-bottom: 12px;
    }
  }

  /* === 子任务模块（旧样式，保留用于移动端） === */
  .subtask-section {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--el-border-color-lighter);
  }

  .subtask-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px 4px;
    border-radius: 4px;
    border-left: 3px solid transparent;
    transition: all 0.2s;

    &:hover {
      background: var(--el-fill-color-light);

      .subtask-delete-btn,
      .subtask-due-time-btn {
        opacity: 1;
      }
    }

    /* 未开始状态 */
    &.status-pending {
      border-left-color: #909399; // 灰色
    }

    /* 处理中状态 */
    &.status-progress {
      border-left-color: #409eff; // 蓝色
      background: rgba(64, 158, 255, 0.03);
    }

    /* 已完成状态 */
    &.status-completed {
      border-left-color: #67c23a; // 绿色
      opacity: 0.8;

      .subtask-content {
        color: var(--el-text-color-placeholder);
      }
    }

    .subtask-main {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .subtask-content {
      flex: 1;
      font-size: 13px;
      color: var(--el-text-color-primary);
      line-height: 1.4;
      transition: color 0.2s;

      &.line-through {
        text-decoration: line-through;
      }
    }

    .subtask-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: 28px;
      font-size: 12px;
    }

    .subtask-due-time {
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--el-text-color-secondary);

      :deep(.art-svg-icon) {
        font-size: 14px;
      }

      &.overdue {
        color: var(--el-color-danger);
      }

      span.overdue {
        color: var(--el-color-danger);
        font-weight: 500;
      }
    }

    .subtask-due-time-btn,
    .subtask-delete-btn {
      opacity: 0;
      transition: opacity 0.2s;
      flex-shrink: 0;
    }

    .subtask-status-select {
      width: 100px;
      flex-shrink: 0;

      :deep(.el-input__wrapper) {
        padding: 0 8px;
      }
    }
  }

  /* === 状态选项样式 === */
  .status-option {
    display: flex;
    align-items: center;
    gap: 6px;

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;

      &.status-pending {
        background: #909399; // 灰色 - 未开始
      }

      &.status-progress {
        background: #409eff; // 蓝色 - 处理中
      }

      &.status-completed {
        background: #67c23a; // 绿色 - 已完成
      }
    }
  }

  .subtask-empty {
    padding: 16px;
    text-align: center;
    font-size: 13px;
    color: var(--el-text-color-placeholder);
  }

  .subtask-add {
    display: flex;
    gap: 8px;

    :deep(.el-input) {
      flex: 1;

      .el-input__prefix {
        color: var(--el-text-color-placeholder);
        display: flex;
        align-items: center;
      }
    }
  }

  /* ==================== 移动端样式 ==================== */
  .mobile-dialog-content {
    margin: -20px;
  }

  .mobile-tabs {
    :deep(.el-tabs__header) {
      margin: 0;
      padding: 0 16px;
      background: var(--el-bg-color);
      border-bottom: 1px solid var(--el-border-color-lighter);
    }

    :deep(.el-tabs__item) {
      height: 44px;
      line-height: 44px;
      font-size: 15px;
    }

    :deep(.el-tabs__content) {
      padding: 0;
    }

    :deep(.el-badge) {
      margin-left: 4px;

      .el-badge__content {
        height: 16px;
        line-height: 16px;
        padding: 0 5px;
        font-size: 10px;
      }
    }
  }

  .mobile-form-wrapper {
    padding: 16px;

    .task-summary-panel {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      margin-top: 4px;
    }

    .attachment-section {
      margin-top: 16px;
    }
  }

  .mobile-activity-wrapper {
    padding: 16px;
  }

  /* 移动端评论输入 */
  .comment-input.mobile {
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
    padding-bottom: 16px;

    .el-button {
      align-self: flex-end;
    }
  }

  /* 活动类型筛选 */
  .activity-filter {
    margin-bottom: 16px;

    :deep(.el-radio-group) {
      width: 100%;
      display: flex;

      .el-radio-button {
        flex: 1;

        .el-radio-button__inner {
          width: 100%;
          padding: 8px 0;
        }
      }
    }
  }

  /* 移动端弹窗布局 */
  @media only screen and (max-width: 768px) {
    :global(.task-detail-dialog.el-dialog) {
      display: flex !important;
      flex-direction: column;
      height: 100dvh;
      margin: 0 !important;
      overflow: hidden !important;
      border-radius: 0 !important;
    }

    :global(.task-detail-dialog.el-dialog > .el-dialog__header) {
      flex: 0 0 auto;
    }

    :global(.task-detail-dialog.el-dialog > .el-dialog__body) {
      flex: 1 1 0 !important;
      min-height: 0;
      overflow-y: auto;
    }

    :global(.task-detail-dialog.el-dialog > .el-dialog__footer) {
      position: static;
      flex: 0 0 auto;
      box-sizing: border-box;
    }

    .task-detail-dialog {
      :deep(.el-dialog__header) {
        flex: 0 0 auto;
        padding: 12px 16px;
        border-bottom: 1px solid var(--el-border-color-lighter);

        .el-dialog__title {
          font-size: 16px;
        }
      }

      :deep(.el-dialog__body) {
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        padding: 0;
      }

      :deep(.el-dialog__footer) {
        position: static;
        flex: 0 0 auto;
        box-sizing: border-box;
        padding: 12px 16px;
        padding-bottom: calc(12px + env(safe-area-inset-bottom));
        background: var(--el-bg-color);
        border-top: 1px solid var(--el-border-color-lighter);
        box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
      }
    }

    .dialog-footer {
      width: 100%;
      gap: 8px;

      .el-button {
        margin-left: 0;
        padding: 10px 12px;
      }

      .footer-right {
        flex: 1;
        min-width: 0;
        justify-content: flex-end;
      }

      &:not(.is-edit-mode) .footer-right {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        width: 100%;

        .el-button {
          width: 100%;
        }
      }
    }

    /* 子任务删除按钮始终显示 */
    .subtask-item .subtask-delete-btn {
      opacity: 1;
    }

    /* 紧凑时间线 */
    .compact-timeline {
      :deep(.el-timeline-item) {
        padding-bottom: 16px;
      }
    }

    .activity-item {
      &.comment {
        .comment-header {
          gap: 6px;

          .user-name {
            font-size: 12px;
          }

          .activity-time {
            font-size: 10px;
          }
        }

        .comment-body {
          padding: 6px 10px;
          font-size: 13px;
        }
      }

      &.log {
        .log-item {
          font-size: 11px;
        }
      }
    }

    .task-summary-panel {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .attachment-item {
      align-items: flex-start;

      .attachment-name {
        white-space: normal;
        word-break: break-word;
      }
    }
  }
</style>
