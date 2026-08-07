<template>
  <div class="recurring-plan-page art-full-height">
    <ElCard class="art-table-card recurring-plan-card" shadow="never">
      <div class="page-head">
        <div class="title-block">
          <div class="eyebrow">
            <ArtSvgIcon icon="ri:repeat-2-line" />
            <span>周期执行</span>
          </div>
          <h3>周期计划</h3>
          <p>{{ scopeLabel }}</p>
        </div>

        <div class="head-actions">
          <ElButton @click="getPlanList">
            <template #icon>
              <ArtSvgIcon icon="ri:refresh-line" />
            </template>
            刷新
          </ElButton>
          <ElButton type="primary" @click="openCreateDialog">
            <template #icon>
              <ArtSvgIcon icon="ri:add-line" />
            </template>
            新建计划
          </ElButton>
        </div>
      </div>

      <div class="metric-strip">
        <div class="metric-item">
          <span class="metric-label">已筛选总数</span>
          <strong>{{ pagination.total }}</strong>
        </div>
        <div class="metric-item">
          <span class="metric-label">本页启用</span>
          <strong>{{ metrics.active }}</strong>
        </div>
        <div class="metric-item danger">
          <span class="metric-label">本页逾期</span>
          <strong>{{ metrics.overdue }}</strong>
        </div>
        <div class="metric-item accent">
          <span class="metric-label">7 天内执行</span>
          <strong>{{ metrics.nextSevenDays }}</strong>
        </div>
      </div>

      <div class="filter-bar">
        <ElInput
          v-model="query.keyword"
          clearable
          placeholder="搜索标题或描述"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <ArtSvgIcon icon="ri:search-line" />
          </template>
        </ElInput>

        <ElSelect v-model="query.status" clearable placeholder="状态">
          <ElOption label="启用" value="ACTIVE" />
          <ElOption label="暂停" value="PAUSED" />
          <ElOption label="结束" value="FINISHED" />
        </ElSelect>

        <ElSelect v-model="query.recurrenceUnit" clearable placeholder="周期">
          <ElOption
            v-for="item in recurrenceOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>

        <ElSelect
          v-if="isPlatformAdmin"
          v-model="query.creatorId"
          clearable
          filterable
          placeholder="创建人"
          :loading="userLoading"
          :filter-method="filterCreatorOptions"
          @visible-change="handleCreatorSelectVisibleChange"
          @clear="resetCreatorSearch"
        >
          <ElOption
            v-for="user in filteredCreatorOptions"
            :key="user.id"
            :label="user.label"
            :value="user.id"
          >
            <div class="user-option">
              <ElAvatar :size="22" :src="user.avatar">{{ getAvatarText(user.label) }}</ElAvatar>
              <span>{{ user.label }}</span>
              <small>{{ user.username }}</small>
            </div>
          </ElOption>
        </ElSelect>

        <ElDatePicker
          v-model="query.nextRunRange"
          type="datetimerange"
          value-format="YYYY-MM-DDTHH:mm:ss"
          format="YYYY-MM-DD HH:mm"
          start-placeholder="下次开始"
          end-placeholder="下次结束"
          range-separator="至"
          class="range-picker"
        />

        <div class="filter-actions">
          <ElButton @click="resetFilters">重置</ElButton>
          <ElButton type="primary" plain @click="handleSearch">
            <template #icon>
              <ArtSvgIcon icon="ri:filter-3-line" />
            </template>
            查询
          </ElButton>
        </div>
      </div>

      <div v-if="!isMobile" class="desktop-list">
        <ElTable v-loading="loading" :data="planList" row-key="id" height="100%" class="plan-table">
          <ElTableColumn label="计划" min-width="280">
            <template #default="{ row }">
              <div class="plan-main-cell">
                <div class="plan-title-row">
                  <span class="plan-title">{{ row.title }}</span>
                  <ElTag :type="statusMeta(row.status).type" effect="light" size="small">
                    {{ statusMeta(row.status).label }}
                  </ElTag>
                  <ElTooltip v-if="isPlanOverdue(row)" :content="row.overdueReason" placement="top">
                    <ElTag type="danger" effect="light" size="small">逾期</ElTag>
                  </ElTooltip>
                </div>
                <div class="description-line">{{ row.description || '未填写描述' }}</div>
                <div v-if="isPlanOverdue(row)" class="overdue-reason">
                  {{ row.overdueReason }}
                </div>
              </div>
            </template>
          </ElTableColumn>

          <ElTableColumn label="周期与时间" min-width="220">
            <template #default="{ row }">
              <div class="stack-cell">
                <span class="strong-line">{{ formatPeriod(row) }}</span>
                <span>开始 {{ formatDateTime(row.startTime) }}</span>
                <span v-if="row.dueTime">截止 {{ formatDateTime(row.dueTime) }}</span>
              </div>
            </template>
          </ElTableColumn>

          <ElTableColumn label="下次执行" min-width="190">
            <template #default="{ row }">
              <div class="stack-cell">
                <span class="strong-line">{{ formatDateTime(row.nextRunAt) }}</span>
                <span v-if="row.nextDueTime">下次截止 {{ formatDateTime(row.nextDueTime) }}</span>
                <span v-else>未设置截止</span>
                <span
                  v-if="row.currentOccurrenceStatus && row.currentOccurrenceStatus !== 'NONE'"
                  class="current-status-line"
                >
                  当前本期：{{ currentOccurrenceStatusMeta(row.currentOccurrenceStatus).label }}
                </span>
              </div>
            </template>
          </ElTableColumn>

          <ElTableColumn label="负责人" min-width="180">
            <template #default="{ row }">
              <div v-if="row.assignees?.length" class="assignee-stack">
                <ElAvatar
                  v-for="person in row.assignees.slice(0, 4)"
                  :key="person.userId"
                  :size="28"
                  :src="person.avatar"
                >
                  {{ getAvatarText(person.nickname) }}
                </ElAvatar>
                <span class="assignee-names">{{ formatAssignees(row) }}</span>
              </div>
              <span v-else class="muted-text">未分配</span>
            </template>
          </ElTableColumn>

          <ElTableColumn v-if="isPlatformAdmin" label="创建人" min-width="150">
            <template #default="{ row }">
              <div class="creator-cell">
                <ElAvatar :size="28" :src="row.creatorAvatar">{{
                  getAvatarText(row.creatorName)
                }}</ElAvatar>
                <span>{{ row.creatorName || `用户 ${row.creatorId}` }}</span>
              </div>
            </template>
          </ElTableColumn>

          <ElTableColumn label="次数" width="110" align="center">
            <template #default="{ row }">
              <span>{{ row.generatedCount || 0 }} / {{ row.maxOccurrences || '不限' }}</span>
            </template>
          </ElTableColumn>

          <ElTableColumn label="操作" width="168" fixed="right" align="center">
            <template #default="{ row }">
              <div class="row-actions">
                <ElTooltip
                  v-if="canGenerateTask(row)"
                  :content="row.currentGeneratedTaskId ? '查看任务' : '生成任务'"
                  placement="top"
                >
                  <ElButton
                    class="action-icon-btn"
                    link
                    type="primary"
                    :aria-label="row.currentGeneratedTaskId ? '查看任务' : '生成任务'"
                    :loading="generatingTaskPlanId === row.id"
                    @click="handleGenerateTask(row)"
                  >
                    <ArtSvgIcon
                      :icon="
                        row.currentGeneratedTaskId ? 'ri:external-link-line' : 'ri:add-box-line'
                      "
                    />
                  </ElButton>
                </ElTooltip>
                <ElTooltip content="完成本期" placement="top">
                  <ElButton
                    class="action-icon-btn"
                    link
                    type="success"
                    aria-label="完成本期"
                    :disabled="!canProcessCurrent(row)"
                    @click="handleOccurrenceAction('complete', row)"
                  >
                    <ArtSvgIcon icon="ri:check-line" />
                  </ElButton>
                </ElTooltip>
                <ElTooltip content="编辑" placement="top">
                  <ElButton
                    class="action-icon-btn"
                    link
                    type="primary"
                    aria-label="编辑"
                    @click="openEditDialog(row)"
                  >
                    <ArtSvgIcon icon="ri:edit-line" />
                  </ElButton>
                </ElTooltip>
                <ElDropdown trigger="click" @command="(command) => handleRowCommand(command, row)">
                  <ElButton class="action-icon-btn" link aria-label="更多操作">
                    <ArtSvgIcon icon="ri:more-2-fill" />
                  </ElButton>
                  <template #dropdown>
                    <ElDropdownMenu>
                      <ElDropdownItem command="skip" :disabled="!canProcessCurrent(row)"
                        >跳过本期</ElDropdownItem
                      >
                      <ElDropdownItem command="defer" :disabled="!canProcessCurrent(row)"
                        >延期本期</ElDropdownItem
                      >
                      <ElDropdownItem command="records" divided>执行记录</ElDropdownItem>
                      <ElDropdownItem v-if="row.status !== 'ACTIVE'" command="enable"
                        >启用</ElDropdownItem
                      >
                      <ElDropdownItem v-if="row.status === 'ACTIVE'" command="pause" divided
                        >暂停</ElDropdownItem
                      >
                      <ElDropdownItem v-if="row.status !== 'FINISHED'" command="finish"
                        >结束</ElDropdownItem
                      >
                      <ElDropdownItem v-if="canDeletePlan(row)" command="delete" divided
                        >删除</ElDropdownItem
                      >
                    </ElDropdownMenu>
                  </template>
                </ElDropdown>
              </div>
            </template>
          </ElTableColumn>
        </ElTable>

        <ElEmpty v-if="!loading && planList.length === 0" description="暂无周期计划" />
      </div>

      <div v-else v-loading="loading" class="mobile-list">
        <ElEmpty v-if="!loading && planList.length === 0" description="暂无周期计划" />
        <article v-for="item in planList" :key="item.id" class="plan-card">
          <div class="card-title-row">
            <div>
              <h4>{{ item.title }}</h4>
              <p>{{ item.description || '未填写描述' }}</p>
            </div>
            <ElTag :type="statusMeta(item.status).type" size="small">{{
              statusMeta(item.status).label
            }}</ElTag>
          </div>

          <div class="card-meta-grid">
            <div>
              <span>周期</span>
              <strong>{{ formatPeriod(item) }}</strong>
            </div>
            <div>
              <span>下次执行</span>
              <strong>{{ formatDateTime(item.nextRunAt) }}</strong>
            </div>
            <div>
              <span>负责人</span>
              <strong>{{ formatAssignees(item) || '未分配' }}</strong>
            </div>
            <div v-if="isPlatformAdmin">
              <span>创建人</span>
              <strong>{{ item.creatorName || `用户 ${item.creatorId}` }}</strong>
            </div>
          </div>

          <div class="card-footer">
            <div class="card-tags">
              <ElTooltip v-if="isPlanOverdue(item)" :content="item.overdueReason" placement="top">
                <ElTag type="danger" size="small">逾期</ElTag>
              </ElTooltip>
              <ElTag v-if="item.reminderEnabled" type="warning" size="small">提醒</ElTag>
            </div>
            <div class="card-actions">
              <ElTooltip
                v-if="canGenerateTask(item)"
                :content="item.currentGeneratedTaskId ? '查看任务' : '生成任务'"
                placement="top"
              >
                <ElButton
                  class="action-icon-btn"
                  link
                  type="primary"
                  :aria-label="item.currentGeneratedTaskId ? '查看任务' : '生成任务'"
                  :loading="generatingTaskPlanId === item.id"
                  @click="handleGenerateTask(item)"
                >
                  <ArtSvgIcon
                    :icon="
                      item.currentGeneratedTaskId ? 'ri:external-link-line' : 'ri:add-box-line'
                    "
                  />
                </ElButton>
              </ElTooltip>
              <ElTooltip content="完成本期" placement="top">
                <ElButton
                  class="action-icon-btn"
                  link
                  type="success"
                  aria-label="完成本期"
                  :disabled="!canProcessCurrent(item)"
                  @click="handleOccurrenceAction('complete', item)"
                >
                  <ArtSvgIcon icon="ri:check-line" />
                </ElButton>
              </ElTooltip>
              <ElTooltip content="编辑" placement="top">
                <ElButton
                  class="action-icon-btn"
                  link
                  type="primary"
                  aria-label="编辑"
                  @click="openEditDialog(item)"
                >
                  <ArtSvgIcon icon="ri:edit-line" />
                </ElButton>
              </ElTooltip>
              <ElDropdown trigger="click" @command="(command) => handleRowCommand(command, item)">
                <ElButton class="action-icon-btn" link aria-label="更多操作">
                  <ArtSvgIcon icon="ri:more-2-fill" />
                </ElButton>
                <template #dropdown>
                  <ElDropdownMenu>
                    <ElDropdownItem command="skip" :disabled="!canProcessCurrent(item)"
                      >跳过本期</ElDropdownItem
                    >
                    <ElDropdownItem command="defer" :disabled="!canProcessCurrent(item)"
                      >延期本期</ElDropdownItem
                    >
                    <ElDropdownItem command="records" divided>执行记录</ElDropdownItem>
                    <ElDropdownItem v-if="item.status !== 'ACTIVE'" command="enable"
                      >启用</ElDropdownItem
                    >
                    <ElDropdownItem v-if="item.status === 'ACTIVE'" command="pause" divided
                      >暂停</ElDropdownItem
                    >
                    <ElDropdownItem v-if="item.status !== 'FINISHED'" command="finish"
                      >结束</ElDropdownItem
                    >
                    <ElDropdownItem v-if="canDeletePlan(item)" command="delete" divided
                      >删除</ElDropdownItem
                    >
                  </ElDropdownMenu>
                </template>
              </ElDropdown>
            </div>
          </div>
          <p v-if="isPlanOverdue(item)" class="overdue-reason mobile-overdue-reason">
            {{ item.overdueReason }}
          </p>
        </article>
      </div>

      <div v-if="pagination.total > 0" class="pagination-wrap">
        <ElPagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          :layout="paginationLayout"
          background
          @current-change="getPlanList"
          @size-change="handleSizeChange"
        />
      </div>
    </ElCard>

    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="760px"
      class="recurring-plan-dialog"
      destroy-on-close
    >
      <ElForm ref="formRef" :model="form" :rules="rules" label-position="top" class="plan-form">
        <div class="form-grid">
          <ElFormItem label="计划标题" prop="title" class="form-span-2">
            <template #label>
              <span class="field-label">
                计划标题
                <ElTooltip
                  :content="fieldTips.title"
                  placement="top-start"
                  popper-class="recurring-field-help-popper"
                  :show-after="120"
                >
                  <span class="field-help" tabindex="0" aria-label="计划标题说明">？</span>
                </ElTooltip>
              </span>
            </template>
            <ElInput
              v-model="form.title"
              maxlength="80"
              show-word-limit
              placeholder="例如：月度安全巡检"
            />
          </ElFormItem>

          <ElFormItem label="负责人" prop="assigneeIds" class="form-span-2">
            <template #label>
              <span class="field-label">
                负责人
                <ElTooltip
                  :content="fieldTips.assigneeIds"
                  placement="top-start"
                  popper-class="recurring-field-help-popper"
                  :show-after="120"
                >
                  <span class="field-help" tabindex="0" aria-label="负责人说明">？</span>
                </ElTooltip>
              </span>
            </template>
            <ElSelect
              v-model="form.assigneeIds"
              multiple
              filterable
              collapse-tags
              collapse-tags-tooltip
              placeholder="选择负责人"
              :loading="userLoading"
              :filter-method="filterAssigneeOptions"
              class="full-input"
              @visible-change="handleAssigneeSelectVisibleChange"
              @clear="resetAssigneeSearch"
            >
              <ElOption
                v-for="user in filteredAssigneeOptions"
                :key="user.id"
                :label="user.label"
                :value="user.id"
              >
                <div class="user-option">
                  <ElAvatar :size="22" :src="user.avatar">{{ getAvatarText(user.label) }}</ElAvatar>
                  <span>{{ user.label }}</span>
                  <small>{{ user.username }}</small>
                </div>
              </ElOption>
            </ElSelect>
          </ElFormItem>

          <ElFormItem label="优先级" prop="priority">
            <template #label>
              <span class="field-label">
                优先级
                <ElTooltip
                  :content="fieldTips.priority"
                  placement="top-start"
                  popper-class="recurring-field-help-popper"
                  :show-after="120"
                >
                  <span class="field-help" tabindex="0" aria-label="优先级说明">？</span>
                </ElTooltip>
              </span>
            </template>
            <ElSelect v-model="form.priority" class="full-input">
              <ElOption label="高" :value="1" />
              <ElOption label="中" :value="2" />
              <ElOption label="低" :value="3" />
            </ElSelect>
          </ElFormItem>

          <ElFormItem label="周期单位" prop="recurrenceUnit">
            <template #label>
              <span class="field-label">
                周期单位
                <ElTooltip
                  :content="fieldTips.recurrenceUnit"
                  placement="top-start"
                  popper-class="recurring-field-help-popper"
                  :show-after="120"
                >
                  <span class="field-help" tabindex="0" aria-label="周期单位说明">？</span>
                </ElTooltip>
              </span>
            </template>
            <ElSelect v-model="form.recurrenceUnit" class="full-input">
              <ElOption
                v-for="item in recurrenceOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>

          <ElFormItem label="重复间隔" prop="intervalCount">
            <template #label>
              <span class="field-label">
                重复间隔
                <ElTooltip
                  :content="fieldTips.intervalCount"
                  placement="top-start"
                  popper-class="recurring-field-help-popper"
                  :show-after="120"
                >
                  <span class="field-help" tabindex="0" aria-label="重复间隔说明">？</span>
                </ElTooltip>
              </span>
            </template>
            <ElInputNumber
              v-model="form.intervalCount"
              :min="1"
              :max="36"
              controls-position="right"
              class="full-input"
            />
          </ElFormItem>

          <ElFormItem label="首次开始时间" prop="startTime">
            <template #label>
              <span class="field-label">
                首次开始时间
                <ElTooltip
                  :content="fieldTips.startTime"
                  placement="top-start"
                  popper-class="recurring-field-help-popper"
                  :show-after="120"
                >
                  <span class="field-help" tabindex="0" aria-label="首次开始时间说明">？</span>
                </ElTooltip>
              </span>
            </template>
            <ElDatePicker
              v-model="form.startTime"
              type="datetime"
              value-format="YYYY-MM-DDTHH:mm:ss"
              format="YYYY-MM-DD HH:mm"
              class="full-input"
            />
          </ElFormItem>

          <ElFormItem label="首次截止时间" prop="dueTime">
            <template #label>
              <span class="field-label">
                首次截止时间
                <ElTooltip
                  :content="fieldTips.dueTime"
                  placement="top-start"
                  popper-class="recurring-field-help-popper"
                  :show-after="120"
                >
                  <span class="field-help" tabindex="0" aria-label="首次截止时间说明">？</span>
                </ElTooltip>
              </span>
            </template>
            <ElDatePicker
              v-model="form.dueTime"
              type="datetime"
              value-format="YYYY-MM-DDTHH:mm:ss"
              format="YYYY-MM-DD HH:mm"
              class="full-input"
            />
          </ElFormItem>

          <ElFormItem label="循环结束时间" prop="endTime">
            <template #label>
              <span class="field-label">
                循环结束时间
                <ElTooltip
                  :content="fieldTips.endTime"
                  placement="top-start"
                  popper-class="recurring-field-help-popper"
                  :show-after="120"
                >
                  <span class="field-help" tabindex="0" aria-label="循环结束时间说明">？</span>
                </ElTooltip>
              </span>
            </template>
            <ElDatePicker
              v-model="form.endTime"
              type="datetime"
              value-format="YYYY-MM-DDTHH:mm:ss"
              format="YYYY-MM-DD HH:mm"
              class="full-input"
            />
          </ElFormItem>

          <ElFormItem label="最大重复次数" prop="maxOccurrences">
            <template #label>
              <span class="field-label">
                最大重复次数
                <ElTooltip
                  :content="fieldTips.maxOccurrences"
                  placement="top-start"
                  popper-class="recurring-field-help-popper"
                  :show-after="120"
                >
                  <span class="field-help" tabindex="0" aria-label="最大重复次数说明">？</span>
                </ElTooltip>
              </span>
            </template>
            <ElInputNumber
              v-model="form.maxOccurrences"
              :min="1"
              :max="999"
              controls-position="right"
              class="full-input"
            />
          </ElFormItem>

          <ElFormItem label="生成看板任务" prop="autoCreateTask">
            <template #label>
              <span class="field-label">
                生成看板任务
                <ElTooltip
                  :content="fieldTips.autoCreateTask"
                  placement="top-start"
                  popper-class="recurring-field-help-popper"
                  :show-after="120"
                >
                  <span class="field-help" tabindex="0" aria-label="生成看板任务说明">？</span>
                </ElTooltip>
              </span>
            </template>
            <ElSwitch v-model="form.autoCreateTask" active-text="开启" inactive-text="关闭" />
          </ElFormItem>

          <ElFormItem v-if="form.autoCreateTask" label="关联项目" prop="projectId">
            <template #label>
              <span class="field-label">
                关联项目
                <ElTooltip
                  :content="fieldTips.projectId"
                  placement="top-start"
                  popper-class="recurring-field-help-popper"
                  :show-after="120"
                >
                  <span class="field-help" tabindex="0" aria-label="关联项目说明">？</span>
                </ElTooltip>
              </span>
            </template>
            <ElSelect
              v-model="form.projectId"
              clearable
              filterable
              placeholder="选择项目"
              :loading="projectLoading"
              class="full-input"
              @change="handleFormProjectChange"
              @visible-change="handleProjectSelectVisibleChange"
            >
              <ElOption
                v-for="project in projectOptions"
                :key="project.id"
                :label="project.name"
                :value="project.id"
              />
            </ElSelect>
          </ElFormItem>

          <ElFormItem v-if="form.autoCreateTask" label="看板阶段" prop="stageId">
            <template #label>
              <span class="field-label">
                看板阶段
                <ElTooltip
                  :content="fieldTips.stageId"
                  placement="top-start"
                  popper-class="recurring-field-help-popper"
                  :show-after="120"
                >
                  <span class="field-help" tabindex="0" aria-label="看板阶段说明">？</span>
                </ElTooltip>
              </span>
            </template>
            <ElSelect
              v-model="form.stageId"
              clearable
              filterable
              placeholder="选择任务生成到哪个看板列"
              :disabled="!form.projectId"
              :loading="stageLoading"
              class="full-input"
            >
              <ElOption
                v-for="stage in stageOptions"
                :key="stage.id"
                :label="stage.name"
                :value="stage.id"
              />
            </ElSelect>
          </ElFormItem>

          <ElFormItem label="邮件提醒">
            <template #label>
              <span class="field-label">
                邮件提醒
                <ElTooltip
                  :content="fieldTips.reminderEnabled"
                  placement="top-start"
                  popper-class="recurring-field-help-popper"
                  :show-after="120"
                >
                  <span class="field-help" tabindex="0" aria-label="邮件提醒说明">？</span>
                </ElTooltip>
              </span>
            </template>
            <ElSwitch v-model="form.reminderEnabled" active-text="开启" inactive-text="关闭" />
          </ElFormItem>

          <ElFormItem v-if="form.reminderEnabled" label="提醒提前量" prop="reminderMinutesBefore">
            <template #label>
              <span class="field-label">
                提醒提前量
                <ElTooltip
                  :content="fieldTips.reminderMinutesBefore"
                  placement="top-start"
                  popper-class="recurring-field-help-popper"
                  :show-after="120"
                >
                  <span class="field-help" tabindex="0" aria-label="提醒提前量说明">？</span>
                </ElTooltip>
              </span>
            </template>
            <ElInputNumber
              v-model="form.reminderMinutesBefore"
              :min="5"
              :max="10080"
              controls-position="right"
              class="full-input"
            />
          </ElFormItem>

          <ElFormItem label="描述" prop="description" class="form-span-2">
            <template #label>
              <span class="field-label">
                描述
                <ElTooltip
                  :content="fieldTips.description"
                  placement="top-start"
                  popper-class="recurring-field-help-popper"
                  :show-after="120"
                >
                  <span class="field-help" tabindex="0" aria-label="描述说明">？</span>
                </ElTooltip>
              </span>
            </template>
            <ElInput
              v-model="form.description"
              type="textarea"
              :rows="4"
              maxlength="500"
              show-word-limit
              placeholder="填写执行口径、验收标准或交付物"
            />
          </ElFormItem>
        </div>
      </ElForm>

      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="dialogVisible = false">取消</ElButton>
          <ElButton type="primary" :loading="submitLoading" @click="submitForm">保存</ElButton>
        </div>
      </template>
    </ElDialog>

    <ElDrawer
      v-model="occurrenceDrawerVisible"
      :title="occurrenceDrawerTitle"
      :size="isMobile ? '100%' : '760px'"
      class="occurrence-drawer"
      destroy-on-close
    >
      <div v-if="activeOccurrencePlan" class="occurrence-panel">
        <div class="occurrence-summary">
          <div>
            <span>当前本期</span>
            <strong>{{ formatDateTime(activeOccurrencePlan.nextRunAt) }}</strong>
            <small v-if="activeOccurrencePlan.nextDueTime"
              >截止 {{ formatDateTime(activeOccurrencePlan.nextDueTime) }}</small
            >
            <small v-else>未设置截止</small>
            <small
              :class="{ 'danger-text': isPlanOverdue(activeOccurrencePlan) }"
              class="current-occurrence-hint"
            >
              {{ currentOccurrenceHint(activeOccurrencePlan) }}
            </small>
          </div>
          <ElTag
            :type="currentOccurrenceStatusMeta(activeOccurrencePlan.currentOccurrenceStatus).type"
            effect="light"
          >
            {{ currentOccurrenceStatusMeta(activeOccurrencePlan.currentOccurrenceStatus).label }}
          </ElTag>
        </div>

        <div class="occurrence-action-bar">
          <ElButton
            v-if="canGenerateTask(activeOccurrencePlan)"
            type="primary"
            plain
            :loading="generatingTaskPlanId === activeOccurrencePlan.id"
            @click="handleGenerateTask(activeOccurrencePlan)"
          >
            <template #icon>
              <ArtSvgIcon icon="ri:add-box-line" />
            </template>
            {{ activeOccurrencePlan.currentGeneratedTaskId ? '查看任务' : '生成任务' }}
          </ElButton>
          <ElButton
            type="success"
            plain
            :disabled="!canProcessCurrent(activeOccurrencePlan)"
            @click="handleOccurrenceAction('complete', activeOccurrencePlan)"
          >
            完成
          </ElButton>
          <ElButton
            type="warning"
            plain
            :disabled="!canProcessCurrent(activeOccurrencePlan)"
            @click="handleOccurrenceAction('skip', activeOccurrencePlan)"
          >
            跳过
          </ElButton>
          <ElButton
            type="primary"
            plain
            :disabled="!canProcessCurrent(activeOccurrencePlan)"
            @click="handleOccurrenceAction('defer', activeOccurrencePlan)"
          >
            延期
          </ElButton>
          <ElButton @click="loadOccurrences">
            <template #icon>
              <ArtSvgIcon icon="ri:refresh-line" />
            </template>
            刷新记录
          </ElButton>
        </div>

        <div class="occurrence-toolbar">
          <ElSelect
            v-model="occurrenceQuery.status"
            clearable
            placeholder="执行状态"
            @change="handleOccurrenceSearch"
          >
            <ElOption
              v-for="item in occurrenceStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
          <ElButton @click="resetOccurrenceFilters">重置</ElButton>
        </div>

        <div class="occurrence-status-guide">
          <span v-for="item in occurrenceStatusGuide" :key="item.status" class="status-guide-item">
            <ElTag :type="occurrenceStatusMeta(item.status).type" effect="light" size="small">
              {{ occurrenceStatusMeta(item.status).label }}
            </ElTag>
            <small>{{ item.text }}</small>
          </span>
        </div>

        <ElTable
          v-loading="occurrenceLoading"
          :data="occurrenceList"
          row-key="id"
          class="occurrence-table"
        >
          <ElTableColumn label="期次" width="72" align="center">
            <template #default="{ row }">#{{ row.occurrenceNo }}</template>
          </ElTableColumn>
          <ElTableColumn label="状态" width="160">
            <template #default="{ row }">
              <div class="occurrence-status-cell">
                <ElTag
                  :type="occurrenceStatusMeta(occurrenceDisplayStatus(row)).type"
                  effect="light"
                  size="small"
                >
                  {{ occurrenceStatusMeta(occurrenceDisplayStatus(row)).label }}
                </ElTag>
                <small v-if="row.overdueReason" class="danger-text">{{ row.overdueReason }}</small>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="计划时间" min-width="190">
            <template #default="{ row }">
              <div class="stack-cell">
                <span class="strong-line">开始 {{ formatDateTime(row.scheduledStartAt) }}</span>
                <span>{{
                  row.dueTime ? `截止 ${formatDateTime(row.dueTime)}` : '未设置截止'
                }}</span>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="负责人快照" min-width="150">
            <template #default="{ row }">
              <span>{{ formatOccurrenceAssignees(row) || '未分配' }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="生成任务" width="110" align="center">
            <template #default="{ row }">
              <ElButton
                v-if="row.generatedTaskId"
                link
                type="success"
                @click="goToGeneratedTask(activeOccurrencePlan?.projectId, row.generatedTaskId)"
              >
                #{{ row.generatedTaskId }}
              </ElButton>
              <span v-else class="muted-text">未生成</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作人" min-width="130">
            <template #default="{ row }">
              <div class="stack-cell">
                <span class="strong-line">{{ row.completedByName || '-' }}</span>
                <span>{{ formatDateTime(row.completedAt) }}</span>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="备注" min-width="180">
            <template #default="{ row }">
              <span class="occurrence-notes">{{ row.notes || '-' }}</span>
            </template>
          </ElTableColumn>
        </ElTable>

        <ElEmpty
          v-if="!occurrenceLoading && occurrenceList.length === 0"
          :description="occurrenceEmptyText"
        >
          <ElButton
            v-if="occurrenceQuery.status"
            type="primary"
            plain
            @click="resetOccurrenceFilters"
          >
            清除状态筛选
          </ElButton>
        </ElEmpty>

        <div v-if="occurrencePagination.total > 0" class="occurrence-pagination">
          <ElPagination
            v-model:current-page="occurrencePagination.current"
            v-model:page-size="occurrencePagination.size"
            :total="occurrencePagination.total"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next"
            background
            @current-change="loadOccurrences"
            @size-change="handleOccurrenceSizeChange"
          />
        </div>
      </div>
    </ElDrawer>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, reactive, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useMediaQuery } from '@vueuse/core'
  import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
  import dayjs from 'dayjs'
  import { fetchGetUserList } from '@/api/system-manage'
  import { useUserStore } from '@/store/modules/user'
  import { getBoardList, type BoardStage } from '@/api/board'
  import { fetchProjectList, type Project } from '@/api/project'
  import {
    completeRecurringPlanCurrent,
    createRecurringPlan,
    deferRecurringPlanCurrent,
    deleteRecurringPlan,
    fetchRecurringPlanList,
    fetchRecurringPlanOccurrences,
    generateRecurringPlanCurrentTask,
    skipRecurringPlanCurrent,
    updateRecurringPlan,
    updateRecurringPlanStatus,
    type RecurrenceUnit,
    type RecurringPlan,
    type RecurringPlanCurrentOccurrenceStatus,
    type RecurringPlanOccurrence,
    type RecurringPlanOccurrenceStatus,
    type RecurringPlanPayload,
    type RecurringPlanQueryParams,
    type RecurringPlanStatus
  } from '@/api/recurring-plan'

  defineOptions({ name: 'RecurringPlanList' })

  interface UserOption {
    id: number
    label: string
    username: string
    avatar?: string
    email?: string
    searchText: string
  }

  interface PlanForm {
    title: string
    description: string
    priority: number
    recurrenceUnit: RecurrenceUnit
    intervalCount: number
    startTime: string
    dueTime: string
    endTime: string
    timezone: string
    reminderEnabled: boolean
    reminderMinutesBefore: number
    autoCreateTask: boolean
    projectId?: number
    stageId?: number
    maxOccurrences?: number
    assigneeIds: number[]
  }

  const DATE_TIME_VALUE_FORMAT = 'YYYY-MM-DDTHH:mm:ss'

  const userStore = useUserStore()
  const router = useRouter()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const formRef = ref<FormInstance>()

  const loading = ref(false)
  const submitLoading = ref(false)
  const dialogVisible = ref(false)
  const dialogMode = ref<'create' | 'edit'>('create')
  const editingPlanId = ref<number>()
  const occurrenceDrawerVisible = ref(false)
  const occurrenceLoading = ref(false)
  const generatingTaskPlanId = ref<number>()
  const activeOccurrencePlan = ref<RecurringPlan>()
  const planList = ref<RecurringPlan[]>([])
  const occurrenceList = ref<RecurringPlanOccurrence[]>([])
  const userOptions = ref<UserOption[]>([])
  const projectOptions = ref<Project[]>([])
  const stageOptions = ref<BoardStage[]>([])
  const creatorSearchKeyword = ref('')
  const assigneeSearchKeyword = ref('')
  const userLoading = ref(false)
  const projectLoading = ref(false)
  const stageLoading = ref(false)
  const USER_OPTION_PAGE_SIZE = 500

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const occurrencePagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const occurrenceQuery = reactive<{
    status: RecurringPlanOccurrenceStatus | ''
  }>({
    status: ''
  })

  const query = reactive<{
    keyword: string
    status: RecurringPlanStatus | ''
    recurrenceUnit: RecurrenceUnit | ''
    creatorId?: number
    nextRunRange: string[]
  }>({
    keyword: '',
    status: '',
    recurrenceUnit: '',
    creatorId: undefined,
    nextRunRange: []
  })

  const recurrenceOptions: Array<{ label: string; value: RecurrenceUnit }> = [
    { label: '每天', value: 'DAY' },
    { label: '每周', value: 'WEEK' },
    { label: '每月', value: 'MONTH' },
    { label: '每季度', value: 'QUARTER' },
    { label: '每半年', value: 'HALF_YEAR' },
    { label: '每年', value: 'YEAR' }
  ]

  const occurrenceStatusOptions: Array<{ label: string; value: RecurringPlanOccurrenceStatus }> = [
    { label: '待处理', value: 'PENDING' },
    { label: '完成', value: 'DONE' },
    { label: '跳过', value: 'SKIPPED' },
    { label: '延期', value: 'DEFERRED' },
    { label: '取消', value: 'CANCELLED' },
    { label: '逾期', value: 'OVERDUE' }
  ]

  const occurrenceStatusGuide: Array<{ status: RecurringPlanOccurrenceStatus; text: string }> = [
    { status: 'DONE', text: '已确认完成并推进到下一期' },
    { status: 'SKIPPED', text: '本期不执行，但已留下跳过记录' },
    { status: 'DEFERRED', text: '本期延期到下一期处理' },
    { status: 'OVERDUE', text: '有截止时间且已超过当前时间' }
  ]

  const defaultForm = (): PlanForm => ({
    title: '',
    description: '',
    priority: 2,
    recurrenceUnit: 'MONTH',
    intervalCount: 1,
    startTime: dayjs().add(1, 'day').hour(9).minute(0).second(0).format(DATE_TIME_VALUE_FORMAT),
    dueTime: '',
    endTime: '',
    timezone: 'Asia/Shanghai',
    reminderEnabled: false,
    reminderMinutesBefore: 60,
    autoCreateTask: false,
    projectId: undefined,
    stageId: undefined,
    maxOccurrences: undefined,
    assigneeIds: []
  })

  const form = reactive<PlanForm>(defaultForm())

  const validateAutoProject = (
    _rule: unknown,
    value: number | undefined,
    callback: (error?: Error) => void
  ) => {
    if (form.autoCreateTask && !value) {
      callback(new Error('请选择生成任务的项目'))
      return
    }
    callback()
  }

  const validateAutoStage = (
    _rule: unknown,
    value: number | undefined,
    callback: (error?: Error) => void
  ) => {
    if (form.autoCreateTask && !value) {
      callback(new Error('请选择生成任务的看板阶段'))
      return
    }
    callback()
  }

  const rules = reactive<FormRules<PlanForm>>({
    title: [{ required: true, message: '请输入计划标题', trigger: 'blur' }],
    assigneeIds: [
      { required: true, type: 'array', min: 1, message: '请选择负责人', trigger: 'change' }
    ],
    recurrenceUnit: [{ required: true, message: '请选择周期单位', trigger: 'change' }],
    intervalCount: [{ required: true, message: '请输入重复间隔', trigger: 'change' }],
    startTime: [{ required: true, message: '请选择首次开始时间', trigger: 'change' }],
    projectId: [{ validator: validateAutoProject, trigger: 'change' }],
    stageId: [{ validator: validateAutoStage, trigger: 'change' }]
  })

  const fieldTips = {
    title: '用于识别这条周期计划，建议写清事项和频率，例如“月度安全巡检”。',
    assigneeIds:
      '实际负责处理这项重复事项的人。负责人可以查看和编辑该计划，并会在自己的工作台看到下一次待办。',
    priority: '用于标记处理优先级，帮助列表和工作台区分轻重缓急。',
    recurrenceUnit: '计划重复的时间粒度，例如每天、每周、每月、每季度、每半年或每年。',
    intervalCount:
      '与周期单位一起决定频率。填 1 表示每个周期执行一次，填 3 表示每 3 个周期执行一次。',
    startTime: '第一次开始执行的时间，也是后续每次执行时间的计算锚点。',
    dueTime:
      '第一次执行的截止时间。系统会用它和首次开始时间的时间差，推算后续每一次的截止时间；不填则不设置单次截止。',
    endTime: '整个循环计划停止的时间。到达该时间后不再继续计算下一次执行；不填表示不设置结束日期。',
    maxOccurrences: '最多重复执行多少次。不填表示不限制次数，可由循环结束时间或手动结束控制。',
    autoCreateTask: '开启后，本期可以手动生成一张项目看板任务，并在执行记录中保留任务链接。',
    projectId: '生成任务时写入的项目。后端会校验当前用户权限以及看板阶段是否属于该项目。',
    stageId: '生成任务时进入的看板列，例如待办、处理中或其他项目自定义阶段。',
    reminderEnabled:
      '标记这条周期计划是否需要提醒。实际通知效果取决于系统邮件提醒配置和后续提醒链路。',
    reminderMinutesBefore: '在计划执行前提前多少分钟提醒，例如 60 表示提前 1 小时。',
    description: '填写执行口径、验收标准、交付物或注意事项，方便负责人理解如何完成。'
  } as const

  const isPlatformAdmin = computed(() => {
    const roles = userStore.info?.roles || []
    return (
      userStore.info?.isAdmin === true || roles.includes('R_SUPER') || roles.includes('R_ADMIN')
    )
  })

  const currentUserId = computed(() => userStore.info?.userId)

  const canDeletePlan = (plan: Pick<RecurringPlan, 'creatorId'>) =>
    isPlatformAdmin.value || plan.creatorId === currentUserId.value

  const scopeLabel = computed(() =>
    isPlatformAdmin.value ? '平台管理员视图：全部创建人' : '个人视图：我创建或负责'
  )

  const dialogTitle = computed(() =>
    dialogMode.value === 'create' ? '新建周期计划' : '编辑周期计划'
  )

  const occurrenceDrawerTitle = computed(() =>
    activeOccurrencePlan.value ? `${activeOccurrencePlan.value.title} · 执行记录` : '执行记录'
  )

  const paginationLayout = computed(() =>
    isMobile.value ? 'prev, pager, next' : 'total, sizes, prev, pager, next, jumper'
  )

  const occurrenceEmptyText = computed(() => {
    if (!occurrenceQuery.status) {
      return '暂无执行记录，完成、跳过或延期本期后会生成记录'
    }
    return `暂无${occurrenceStatusMeta(occurrenceQuery.status).label}执行记录`
  })

  const metrics = computed(() => {
    const now = dayjs()
    const nextSevenDays = now.add(7, 'day')
    return {
      active: planList.value.filter((item) => item.status === 'ACTIVE').length,
      overdue: planList.value.filter((item) => isPlanOverdue(item)).length,
      nextSevenDays: planList.value.filter((item) => {
        if (!item.nextRunAt) return false
        const nextRunAt = dayjs(item.nextRunAt)
        return nextRunAt.isAfter(now) && nextRunAt.isBefore(nextSevenDays)
      }).length
    }
  })

  const filteredCreatorOptions = computed(() => filterUserOptions(creatorSearchKeyword.value))

  const filteredAssigneeOptions = computed(() => filterUserOptions(assigneeSearchKeyword.value))

  const filterUserOptions = (keyword: string) => {
    const query = keyword.trim().toLowerCase()
    if (!query) return userOptions.value
    return userOptions.value.filter((user) => user.searchText.includes(query))
  }

  const buildQueryParams = (): RecurringPlanQueryParams => {
    const params: RecurringPlanQueryParams = {
      current: pagination.current,
      size: pagination.size
    }
    const keyword = query.keyword.trim()
    if (keyword) params.keyword = keyword
    if (query.status) params.status = query.status
    if (query.recurrenceUnit) params.recurrenceUnit = query.recurrenceUnit
    if (isPlatformAdmin.value && query.creatorId) params.creatorId = Number(query.creatorId)
    if (query.nextRunRange.length === 2) {
      params.nextRunStart = query.nextRunRange[0]
      params.nextRunEnd = query.nextRunRange[1]
    }
    return params
  }

  const getPlanList = async () => {
    loading.value = true
    try {
      const result = await fetchRecurringPlanList(buildQueryParams())
      planList.value = result?.records || []
      pagination.total = Number(result?.total || 0)
      pagination.current = Number(result?.current || pagination.current)
      pagination.size = Number(result?.size || pagination.size)
    } catch (error) {
      console.error('获取周期计划失败:', error)
    } finally {
      loading.value = false
    }
  }

  const openOccurrenceDrawer = async (row: RecurringPlan) => {
    activeOccurrencePlan.value = row
    occurrencePagination.current = 1
    occurrenceQuery.status = ''
    occurrenceDrawerVisible.value = true
    await loadOccurrences()
  }

  const loadOccurrences = async () => {
    if (!activeOccurrencePlan.value) return
    occurrenceLoading.value = true
    try {
      const result = await fetchRecurringPlanOccurrences(activeOccurrencePlan.value.id, {
        current: occurrencePagination.current,
        size: occurrencePagination.size,
        status: occurrenceQuery.status || undefined
      })
      occurrenceList.value = result?.records || []
      occurrencePagination.total = Number(result?.total || 0)
      occurrencePagination.current = Number(result?.current || occurrencePagination.current)
      occurrencePagination.size = Number(result?.size || occurrencePagination.size)
    } catch (error) {
      console.error('获取周期计划执行记录失败:', error)
    } finally {
      occurrenceLoading.value = false
    }
  }

  const handleOccurrenceSearch = () => {
    occurrencePagination.current = 1
    loadOccurrences()
  }

  const resetOccurrenceFilters = () => {
    occurrenceQuery.status = ''
    occurrencePagination.current = 1
    loadOccurrences()
  }

  const loadUserOptions = async () => {
    userLoading.value = true
    try {
      const records = await fetchAllUserOptions()
      userOptions.value = records.map((item) => {
        const user = item as Api.SystemManage.UserListItem & { email?: string }
        const label = user.nickname || user.username || `用户 ${user.id}`
        const username = user.username || ''
        const email = user.userEmail || user.email || ''
        return {
          id: Number(user.id),
          label,
          username,
          avatar: user.avatar,
          email,
          searchText: [label, username, email].filter(Boolean).join(' ').toLowerCase()
        }
      })
    } catch (error) {
      console.error('获取用户列表失败:', error)
    } finally {
      userLoading.value = false
    }
  }

  const loadProjectOptions = async () => {
    if (projectOptions.value.length > 0) return
    projectLoading.value = true
    try {
      projectOptions.value = await fetchProjectList(false)
    } catch (error) {
      console.error('获取项目列表失败:', error)
    } finally {
      projectLoading.value = false
    }
  }

  const loadStageOptions = async (projectId?: number, selectedStageId?: number) => {
    stageOptions.value = []
    if (!projectId) return
    stageLoading.value = true
    try {
      const stages = await getBoardList(projectId)
      stageOptions.value = stages || []
      if (selectedStageId && stageOptions.value.some((stage) => stage.id === selectedStageId)) {
        form.stageId = selectedStageId
      } else if (form.stageId && !stageOptions.value.some((stage) => stage.id === form.stageId)) {
        form.stageId = undefined
      }
    } catch (error) {
      console.error('获取看板阶段失败:', error)
    } finally {
      stageLoading.value = false
    }
  }

  const fetchAllUserOptions = async () => {
    const records: Api.SystemManage.UserListItem[] = []
    let current = 1
    let total = 0
    do {
      const result = await fetchGetUserList({ current, size: USER_OPTION_PAGE_SIZE })
      const pageRecords = result?.records || []
      records.push(...pageRecords)
      total = Number(result?.total || records.length)
      current += 1
      if (pageRecords.length === 0) break
    } while (records.length < total)
    return records
  }

  const handleSearch = () => {
    pagination.current = 1
    getPlanList()
  }

  const handleCreatorSelectVisibleChange = async (isVisible: boolean) => {
    if (isVisible && userOptions.value.length === 0) {
      await loadUserOptions()
    }
    if (!isVisible) {
      resetCreatorSearch()
    }
  }

  const handleAssigneeSelectVisibleChange = async (isVisible: boolean) => {
    if (isVisible && userOptions.value.length === 0) {
      await loadUserOptions()
    }
    if (!isVisible) {
      resetAssigneeSearch()
    }
  }

  const handleProjectSelectVisibleChange = async (isVisible: boolean) => {
    if (isVisible) {
      await loadProjectOptions()
    }
  }

  const handleFormProjectChange = async (value?: number) => {
    form.stageId = undefined
    await loadStageOptions(value)
  }

  const filterCreatorOptions = (query: string) => {
    creatorSearchKeyword.value = query
  }

  const filterAssigneeOptions = (query: string) => {
    assigneeSearchKeyword.value = query
  }

  const resetCreatorSearch = () => {
    creatorSearchKeyword.value = ''
  }

  const resetAssigneeSearch = () => {
    assigneeSearchKeyword.value = ''
  }

  const resetFilters = () => {
    query.keyword = ''
    query.status = ''
    query.recurrenceUnit = ''
    query.creatorId = undefined
    query.nextRunRange = []
    resetCreatorSearch()
    pagination.current = 1
    getPlanList()
  }

  const handleSizeChange = () => {
    pagination.current = 1
    getPlanList()
  }

  const handleOccurrenceSizeChange = () => {
    occurrencePagination.current = 1
    loadOccurrences()
  }

  const openCreateDialog = async () => {
    dialogMode.value = 'create'
    editingPlanId.value = undefined
    resetAssigneeSearch()
    stageOptions.value = []
    Object.assign(form, defaultForm())
    dialogVisible.value = true
    await Promise.all([loadUserOptions(), loadProjectOptions()])
  }

  const openEditDialog = async (row: RecurringPlan) => {
    dialogMode.value = 'edit'
    editingPlanId.value = row.id
    resetAssigneeSearch()
    mergeAssigneeOptions(row)
    await loadProjectOptions()
    Object.assign(form, {
      title: row.title,
      description: row.description || '',
      priority: row.priority || 2,
      recurrenceUnit: row.recurrenceUnit,
      intervalCount: row.intervalCount || 1,
      startTime: toDatePickerValue(row.startTime),
      dueTime: toDatePickerValue(row.dueTime),
      endTime: toDatePickerValue(row.endTime),
      timezone: row.timezone || 'Asia/Shanghai',
      reminderEnabled: row.reminderEnabled === true,
      reminderMinutesBefore: row.reminderMinutesBefore || 60,
      autoCreateTask: row.autoCreateTask === true,
      projectId: row.projectId,
      stageId: row.stageId,
      maxOccurrences: row.maxOccurrences,
      assigneeIds: row.assigneeIds?.length
        ? row.assigneeIds
        : row.assignees?.map((item) => item.userId) || []
    })
    await loadStageOptions(row.projectId, row.stageId)
    dialogVisible.value = true
    if (userOptions.value.length === 0) await loadUserOptions()
  }

  const mergeAssigneeOptions = (plan: RecurringPlan) => {
    ;(plan.assignees || []).forEach((item) => {
      if (userOptions.value.some((user) => user.id === item.userId)) return
      userOptions.value.push({
        id: item.userId,
        label: item.nickname || `用户 ${item.userId}`,
        username: '',
        avatar: item.avatar,
        searchText: [item.nickname || '', item.userId].filter(Boolean).join(' ').toLowerCase()
      })
    })
  }

  const submitForm = async () => {
    if (!formRef.value) return
    try {
      await formRef.value.validate()
      submitLoading.value = true
      const payload = normalizePayload()
      if (dialogMode.value === 'create') {
        await createRecurringPlan(payload)
        ElMessage.success('周期计划创建成功')
      } else if (editingPlanId.value) {
        await updateRecurringPlan(editingPlanId.value, payload)
        ElMessage.success('周期计划更新成功')
      }
      dialogVisible.value = false
      await getPlanList()
    } catch (error) {
      console.error('保存周期计划失败:', error)
    } finally {
      submitLoading.value = false
    }
  }

  const normalizePayload = (): RecurringPlanPayload => {
    const payload: RecurringPlanPayload = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      priority: form.priority,
      recurrenceUnit: form.recurrenceUnit,
      intervalCount: form.intervalCount,
      startTime: form.startTime,
      dueTime: form.dueTime || undefined,
      endTime: form.endTime || undefined,
      timezone: form.timezone.trim() || 'Asia/Shanghai',
      reminderEnabled: form.reminderEnabled,
      reminderMinutesBefore: form.reminderEnabled ? form.reminderMinutesBefore : undefined,
      autoCreateTask: form.autoCreateTask,
      projectId: form.projectId,
      stageId: form.stageId,
      maxOccurrences: positiveNumberOrUndefined(form.maxOccurrences),
      assigneeIds: form.assigneeIds
    }
    return payload
  }

  type OccurrenceAction = 'complete' | 'skip' | 'defer'

  const canProcessCurrent = (plan?: Pick<RecurringPlan, 'currentOccurrenceActionable'>) =>
    plan?.currentOccurrenceActionable === true

  const canGenerateTask = (
    plan?: Pick<
      RecurringPlan,
      'autoCreateTask' | 'currentOccurrenceActionable' | 'projectId' | 'stageId'
    >
  ) =>
    plan?.autoCreateTask === true &&
    canProcessCurrent(plan) &&
    Boolean(plan.projectId) &&
    Boolean(plan.stageId)

  const goToGeneratedTask = (projectId?: number, taskId?: number) => {
    if (!projectId || !taskId) {
      ElMessage.warning('缺少生成任务的项目或任务ID')
      return
    }
    const projectName = projectOptions.value.find((project) => project.id === projectId)?.name
    router.push({
      name: 'KanbanBoard',
      params: { projectId },
      query: {
        ...(projectName ? { name: projectName } : {}),
        taskId: String(taskId)
      }
    })
  }

  const refreshPlanAndOccurrences = async (planId: number) => {
    await getPlanList()
    refreshActiveOccurrencePlan(planId)
    if (occurrenceDrawerVisible.value && activeOccurrencePlan.value?.id === planId) {
      await loadOccurrences()
    }
  }

  const handleGenerateTask = async (row?: RecurringPlan) => {
    if (!row) return
    if (!canGenerateTask(row)) {
      ElMessage.warning('该计划当前不能生成任务')
      return
    }
    if (row.currentGeneratedTaskId) {
      goToGeneratedTask(row.projectId, row.currentGeneratedTaskId)
      return
    }

    generatingTaskPlanId.value = row.id
    try {
      const result = await generateRecurringPlanCurrentTask(row.id)
      ElMessage.success(result?.reused ? '本期任务已存在' : '本期任务已生成')
      await refreshPlanAndOccurrences(row.id)
    } catch (error) {
      console.error('生成周期计划任务失败:', error)
    } finally {
      generatingTaskPlanId.value = undefined
    }
  }

  const occurrenceActionMeta = (action: OccurrenceAction) => {
    const map: Record<
      OccurrenceAction,
      {
        title: string
        message: string
        confirmButtonText: string
        success: string
      }
    > = {
      complete: {
        title: '完成本期',
        message: '确认本期已经完成？可填写执行备注。',
        confirmButtonText: '确认完成',
        success: '本期已完成，计划已推进到下一期'
      },
      skip: {
        title: '跳过本期',
        message: '确认跳过本期？可填写跳过原因。',
        confirmButtonText: '确认跳过',
        success: '本期已跳过，计划已推进到下一期'
      },
      defer: {
        title: '延期本期',
        message: '确认将本期延期到下一期？可填写延期原因。',
        confirmButtonText: '确认延期',
        success: '本期已延期，计划已推进到下一期'
      }
    }
    return map[action]
  }

  const handleOccurrenceAction = async (action: OccurrenceAction, row: RecurringPlan) => {
    if (!canProcessCurrent(row)) {
      ElMessage.warning('该计划当前不能处理本期')
      return
    }
    const meta = occurrenceActionMeta(action)
    let notes = ''
    try {
      const result = await ElMessageBox.prompt(meta.message, meta.title, {
        type: action === 'complete' ? 'success' : 'warning',
        inputType: 'textarea',
        inputPlaceholder: '备注可选，最多 500 字',
        inputValidator: (value) => {
          if (typeof value === 'string' && value.length > 500) return '备注不能超过 500 字'
          return true
        },
        confirmButtonText: meta.confirmButtonText,
        cancelButtonText: '取消'
      })
      notes = typeof result.value === 'string' ? result.value.trim() : ''
    } catch (error) {
      if (error !== 'cancel' && error !== 'close') {
        console.error('取消处理周期计划本期:', error)
      }
      return
    }

    const payload = notes ? { notes } : undefined
    try {
      if (action === 'complete') {
        await completeRecurringPlanCurrent(row.id, payload)
      } else if (action === 'skip') {
        await skipRecurringPlanCurrent(row.id, payload)
      } else {
        await deferRecurringPlanCurrent(row.id, payload)
      }
      ElMessage.success(meta.success)
      await getPlanList()
      refreshActiveOccurrencePlan(row.id)
      if (occurrenceDrawerVisible.value && activeOccurrencePlan.value?.id === row.id) {
        await loadOccurrences()
      }
    } catch (error) {
      console.error('处理周期计划本期失败:', error)
    }
  }

  const refreshActiveOccurrencePlan = (planId: number) => {
    if (!activeOccurrencePlan.value || activeOccurrencePlan.value.id !== planId) return
    const latestPlan = planList.value.find((item) => item.id === planId)
    if (latestPlan) activeOccurrencePlan.value = latestPlan
  }

  const handleRowCommand = async (command: unknown, row: RecurringPlan) => {
    const action = String(command)
    if (action === 'records') {
      await openOccurrenceDrawer(row)
      return
    }
    if (['complete', 'skip', 'defer'].includes(action)) {
      await handleOccurrenceAction(action as OccurrenceAction, row)
      return
    }
    if (action === 'delete') {
      await confirmDelete(row)
      return
    }
    const statusMap: Record<string, RecurringPlanStatus> = {
      enable: 'ACTIVE',
      pause: 'PAUSED',
      finish: 'FINISHED'
    }
    const nextStatus = statusMap[action]
    if (!nextStatus) return
    if (nextStatus === 'FINISHED') {
      try {
        await ElMessageBox.confirm('结束后该计划不会再进入周期队列。确定结束吗？', '结束周期计划', {
          type: 'warning'
        })
      } catch {
        return
      }
    }
    try {
      await updateRecurringPlanStatus(row.id, nextStatus)
      ElMessage.success(statusActionText(nextStatus))
      await getPlanList()
    } catch (error) {
      console.error('更新周期计划状态失败:', error)
    }
  }

  const confirmDelete = async (row: RecurringPlan) => {
    try {
      await ElMessageBox.confirm('删除后该周期计划不可恢复。确定删除吗？', '删除周期计划', {
        type: 'error'
      })
      await deleteRecurringPlan(row.id)
      ElMessage.success('周期计划已删除')
      await getPlanList()
    } catch (error) {
      if (error !== 'cancel' && error !== 'close') {
        console.error('删除周期计划失败:', error)
      }
    }
  }

  const statusMeta = (status: RecurringPlanStatus) => {
    const map: Record<
      RecurringPlanStatus,
      { label: string; type: 'success' | 'warning' | 'info' }
    > = {
      ACTIVE: { label: '启用', type: 'success' },
      PAUSED: { label: '暂停', type: 'warning' },
      FINISHED: { label: '结束', type: 'info' }
    }
    return map[status] || map.ACTIVE
  }

  const occurrenceStatusMeta = (status: RecurringPlanOccurrenceStatus) => {
    const map: Record<
      RecurringPlanOccurrenceStatus,
      { label: string; type: 'success' | 'warning' | 'info' | 'danger' | 'primary' }
    > = {
      PENDING: { label: '待处理', type: 'warning' },
      DONE: { label: '完成', type: 'success' },
      SKIPPED: { label: '跳过', type: 'info' },
      DEFERRED: { label: '延期', type: 'primary' },
      CANCELLED: { label: '取消', type: 'info' },
      OVERDUE: { label: '逾期', type: 'danger' }
    }
    return map[status] || map.PENDING
  }

  const currentOccurrenceStatusMeta = (status?: RecurringPlanCurrentOccurrenceStatus) => {
    const map: Record<
      RecurringPlanCurrentOccurrenceStatus,
      { label: string; type: 'success' | 'warning' | 'info' | 'danger' | 'primary' }
    > = {
      NONE: { label: '无本期', type: 'info' },
      PENDING: { label: '待处理', type: 'warning' },
      DONE: { label: '完成', type: 'success' },
      SKIPPED: { label: '跳过', type: 'info' },
      DEFERRED: { label: '延期', type: 'primary' },
      CANCELLED: { label: '取消', type: 'info' },
      OVERDUE: { label: '逾期', type: 'danger' }
    }
    return map[status || 'NONE'] || map.NONE
  }

  const statusActionText = (status: RecurringPlanStatus) => {
    const map: Record<RecurringPlanStatus, string> = {
      ACTIVE: '周期计划已启用',
      PAUSED: '周期计划已暂停',
      FINISHED: '周期计划已结束'
    }
    return map[status]
  }

  const formatPeriod = (plan: Pick<RecurringPlan, 'recurrenceUnit' | 'intervalCount'>) => {
    const interval = plan.intervalCount || 1
    if (interval === 1) {
      const option = recurrenceOptions.find((item) => item.value === plan.recurrenceUnit)
      return option?.label || '每月'
    }
    const unitMap: Record<RecurrenceUnit, string> = {
      DAY: '天',
      WEEK: '周',
      MONTH: '个月',
      QUARTER: '个季度',
      HALF_YEAR: '个半年',
      YEAR: '年'
    }
    return `每 ${interval} ${unitMap[plan.recurrenceUnit]}`
  }

  const formatDateTime = (value?: string) => {
    if (!value) return '-'
    const time = dayjs(value)
    return time.isValid() ? time.format('YYYY-MM-DD HH:mm') : '-'
  }

  const toDatePickerValue = (value?: string) => {
    if (!value) return ''
    const time = dayjs(value)
    return time.isValid() ? time.format(DATE_TIME_VALUE_FORMAT) : ''
  }

  const formatAssignees = (plan: RecurringPlan) =>
    (plan.assignees || [])
      .map((item) => item.nickname || `用户 ${item.userId}`)
      .filter(Boolean)
      .join('、')

  const formatOccurrenceAssignees = (occurrence: RecurringPlanOccurrence) =>
    (occurrence.assignees || [])
      .map((item) => item.nickname || `用户 ${item.userId}`)
      .filter(Boolean)
      .join('、')

  const currentOccurrenceHint = (plan: RecurringPlan) => {
    if (plan.overdueReason) return plan.overdueReason
    if (plan.currentOccurrenceStatus === 'NONE') return '当前没有待处理本期'
    if (!plan.nextDueTime) return '当前本期待处理，未设置截止时间，不按开始时间判定逾期'
    return '当前本期待处理，截止时间尚未逾期'
  }

  const occurrenceDisplayStatus = (occurrence: RecurringPlanOccurrence) =>
    occurrence.overdue === true ? 'OVERDUE' : occurrence.status

  const isPlanOverdue = (plan: RecurringPlan) => {
    return plan.overdue === true
  }

  const getAvatarText = (name?: string) => (name ? name.slice(0, 1).toUpperCase() : '用')

  const positiveNumberOrUndefined = (value?: number) =>
    typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : undefined

  onMounted(async () => {
    await Promise.all([getPlanList(), loadUserOptions()])
  })
</script>

<style lang="scss" scoped>
  .recurring-plan-page {
    min-height: 0;

    :deep(.recurring-plan-card) {
      min-height: 0;
    }

    :deep(.recurring-plan-card > .el-card__body) {
      display: flex;
      flex-direction: column;
      min-height: 0;
      padding: 20px;
      overflow: hidden;
    }

    .page-head {
      display: flex;
      flex: 0 0 auto;
      gap: 16px;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .title-block {
      min-width: 0;

      .eyebrow {
        display: inline-flex;
        gap: 6px;
        align-items: center;
        margin-bottom: 6px;
        font-size: 13px;
        font-weight: 600;
        color: #0f766e;
      }

      h3 {
        margin: 0;
        font-size: 22px;
        font-weight: 700;
        line-height: 1.25;
        color: var(--el-text-color-primary);
        letter-spacing: 0;
      }

      p {
        margin: 6px 0 0;
        font-size: 13px;
        color: var(--el-text-color-secondary);
      }
    }

    .head-actions {
      display: flex;
      gap: 10px;
      align-items: center;
      flex-shrink: 0;
    }

    .metric-strip {
      display: grid;
      flex: 0 0 auto;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      margin-bottom: 16px;
      overflow: hidden;
      background: var(--el-bg-color);
      border: 1px solid var(--el-border-color-lighter);
      border-radius: 8px;
    }

    .metric-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 0;
      padding: 14px 16px;
      border-right: 1px solid var(--el-border-color-lighter);

      &:last-child {
        border-right: none;
      }

      .metric-label {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }

      strong {
        font-size: 24px;
        font-weight: 700;
        line-height: 1;
        color: var(--el-text-color-primary);
      }

      &.danger strong {
        color: #b42318;
      }

      &.accent strong {
        color: #0f766e;
      }
    }

    .filter-bar {
      display: grid;
      flex: 0 0 auto;
      grid-template-columns:
        minmax(220px, 1.2fr) 130px 150px minmax(220px, 1fr) minmax(300px, 1.3fr)
        auto;
      gap: 12px;
      align-items: center;
      margin-bottom: 16px;
    }

    .range-picker {
      width: 100%;
    }

    .filter-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }

    .desktop-list {
      position: relative;
      flex: 1 1 auto;
      min-height: 0;
      overflow: hidden;
      border: 1px solid var(--el-border-color-lighter);
      border-radius: 8px;
    }

    .plan-table {
      height: 100%;
      width: 100%;
    }

    .plan-main-cell {
      min-width: 0;
    }

    .plan-title-row {
      display: flex;
      gap: 8px;
      align-items: center;
      min-width: 0;
      margin-bottom: 5px;
    }

    .plan-title {
      overflow: hidden;
      font-weight: 600;
      color: var(--el-text-color-primary);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .description-line {
      overflow: hidden;
      font-size: 12px;
      color: var(--el-text-color-secondary);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .overdue-reason {
      margin-top: 4px;
      overflow: hidden;
      font-size: 12px;
      line-height: 1.4;
      color: #b42318;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .stack-cell {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 12px;
      line-height: 1.35;
      color: var(--el-text-color-secondary);

      .strong-line {
        font-size: 13px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      .current-status-line {
        color: #0f766e;
      }
    }

    .assignee-stack,
    .creator-cell {
      display: flex;
      gap: 8px;
      align-items: center;
      min-width: 0;
    }

    .assignee-stack {
      :deep(.el-avatar + .el-avatar) {
        margin-left: -14px;
        border: 2px solid var(--el-bg-color);
      }
    }

    .assignee-names,
    .creator-cell span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .muted-text {
      color: var(--el-text-color-placeholder);
    }

    .row-actions {
      display: flex;
      gap: 4px;
      align-items: center;
      justify-content: center;
      white-space: nowrap;
    }

    .row-actions,
    .card-actions {
      :deep(.el-button + .el-button) {
        margin-left: 0;
      }
    }

    .action-icon-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      padding: 0;
      font-size: 17px;
    }

    .pagination-wrap {
      display: flex;
      flex: 0 0 auto;
      justify-content: flex-end;
      padding-top: 16px;
    }

    .mobile-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      flex: 1 1 auto;
      min-height: 220px;
      overflow-x: hidden;
      overflow-y: auto;
      overscroll-behavior: contain;
      padding-right: 4px;
      -webkit-overflow-scrolling: touch;
    }

    .plan-card {
      padding: 14px;
      background: var(--el-bg-color);
      border: 1px solid var(--el-border-color-lighter);
      border-radius: 8px;
    }

    .card-title-row {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 12px;

      h4 {
        margin: 0;
        font-size: 16px;
        font-weight: 700;
        line-height: 1.35;
        color: var(--el-text-color-primary);
      }

      p {
        display: -webkit-box;
        margin: 4px 0 0;
        overflow: hidden;
        font-size: 12px;
        color: var(--el-text-color-secondary);
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
    }

    .card-meta-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
      padding: 12px 0;
      border-top: 1px solid var(--el-border-color-lighter);
      border-bottom: 1px solid var(--el-border-color-lighter);

      div {
        min-width: 0;
      }

      span {
        display: block;
        margin-bottom: 3px;
        font-size: 11px;
        color: var(--el-text-color-secondary);
      }

      strong {
        display: block;
        overflow: hidden;
        font-size: 13px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .card-footer {
      display: flex;
      gap: 10px;
      align-items: center;
      justify-content: space-between;
      padding-top: 12px;
    }

    .card-tags,
    .card-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      min-width: 0;
    }

    .mobile-overdue-reason {
      margin: 10px 0 0;
      white-space: normal;
    }
  }

  .user-option {
    display: flex;
    gap: 8px;
    align-items: center;
    min-width: 0;

    span {
      overflow: hidden;
      font-size: 13px;
      color: var(--el-text-color-primary);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    small {
      margin-left: auto;
      overflow: hidden;
      font-size: 12px;
      color: var(--el-text-color-placeholder);
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .plan-form {
    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0 18px;
    }

    .form-span-2 {
      grid-column: span 2;
    }

    .full-input {
      width: 100%;
    }

    .field-label {
      display: inline-flex;
      gap: 6px;
      align-items: center;
      max-width: 100%;
      font-weight: 600;
      line-height: 1.2;
      color: var(--el-text-color-primary);
    }

    .field-help {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      font-size: 11px;
      font-weight: 700;
      line-height: 1;
      color: var(--el-color-primary);
      cursor: help;
      background: color-mix(in srgb, var(--el-color-primary) 10%, transparent);
      border: 1px solid color-mix(in srgb, var(--el-color-primary) 28%, transparent);
      border-radius: 50%;
      outline: none;
      transition:
        color 0.2s ease,
        background 0.2s ease,
        border-color 0.2s ease,
        box-shadow 0.2s ease;

      &:hover,
      &:focus-visible {
        color: #fff;
        background: var(--el-color-primary);
        border-color: var(--el-color-primary);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--el-color-primary) 16%, transparent);
      }
    }
  }

  :global(.recurring-field-help-popper) {
    max-width: 320px;
    font-size: 12px;
    line-height: 1.55;
  }

  .dialog-footer {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }

  .occurrence-panel {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .occurrence-summary {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;

    div {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }

    span,
    small {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }

    strong {
      overflow: hidden;
      font-size: 18px;
      color: var(--el-text-color-primary);
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .occurrence-action-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }

  .occurrence-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;

    .el-select {
      width: 180px;
    }
  }

  .occurrence-status-guide {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px 12px;
    padding: 10px 12px;
    background: var(--el-fill-color-lighter);
    border-radius: 8px;
  }

  .status-guide-item {
    display: flex;
    gap: 8px;
    align-items: center;
    min-width: 0;

    small {
      overflow: hidden;
      color: var(--el-text-color-secondary);
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .occurrence-table {
    width: 100%;
  }

  .occurrence-status-cell {
    display: flex;
    flex-direction: column;
    gap: 5px;
    align-items: flex-start;

    small {
      display: -webkit-box;
      overflow: hidden;
      max-width: 160px;
      line-height: 1.35;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }

  .occurrence-notes {
    display: -webkit-box;
    overflow: hidden;
    line-height: 1.5;
    color: var(--el-text-color-regular);
    text-overflow: ellipsis;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .occurrence-pagination {
    display: flex;
    justify-content: flex-end;
  }

  .current-occurrence-hint {
    max-width: 560px;
  }

  .danger-text {
    color: #b42318 !important;
  }

  @media (max-width: 1280px) {
    .recurring-plan-page {
      .filter-bar {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .filter-actions {
        justify-content: flex-start;
      }
    }
  }

  @media (max-width: 768px) {
    .recurring-plan-page {
      :deep(.recurring-plan-card > .el-card__body) {
        padding: 12px;
      }

      .page-head {
        flex-direction: column;
      }

      .head-actions {
        width: 100%;

        .el-button {
          flex: 1;
        }
      }

      .metric-strip {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .metric-item {
        border-bottom: 1px solid var(--el-border-color-lighter);

        &:nth-child(2n) {
          border-right: none;
        }

        &:nth-last-child(-n + 2) {
          border-bottom: none;
        }
      }

      .filter-bar {
        grid-template-columns: 1fr;
      }

      .filter-actions {
        .el-button {
          flex: 1;
        }
      }

      .pagination-wrap {
        justify-content: center;
      }

      .card-footer {
        align-items: flex-start;
        flex-direction: column;
      }
    }

    .occurrence-status-guide {
      grid-template-columns: 1fr;
    }

    .plan-form {
      .form-grid {
        grid-template-columns: 1fr;
      }

      .form-span-2 {
        grid-column: span 1;
      }
    }
  }
</style>
