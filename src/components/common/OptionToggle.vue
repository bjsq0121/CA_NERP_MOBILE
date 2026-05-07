<template>
  <button
    type="button"
    class="option-toggle"
    :class="modelValue ? 'toggle-on' : 'toggle-off'"
    :disabled="disabled"
    :aria-pressed="modelValue ? 'true' : 'false'"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <span class="option-label">{{ label }}</span>
    <span class="option-state">{{ modelValue ? 'ON' : 'OFF' }}</span>
  </button>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, required: true },
  disabled: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.option-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 40px;
  padding: 0 8px 0 11px;
  border: 1.5px solid var(--c-border);
  border-radius: 8px;
  background: var(--c-surface);
  color: var(--c-text);
  font-size: 12px;
  font-weight: 600;
  transition: background var(--transition), border-color var(--transition), color var(--transition), box-shadow var(--transition);
  width: 100%;
}

.option-toggle.toggle-on {
  border-color: #2563eb;
  background: #eff6ff;
  color: #1d4ed8;
  box-shadow: 0 1px 4px rgba(37, 99, 235, .12);
}

.option-toggle.toggle-off {
  border-color: #e2e8f0;
  background: #fff;
  color: #64748b;
}

.option-toggle:disabled {
  cursor: not-allowed;
  border-color: #e2e8f0;
  background: #f1f5f9;
  color: #94a3b8;
  box-shadow: none;
}

.option-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.option-state {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 32px;
  height: 22px;
  margin-left: 8px;
  border-radius: 999px;
  background: #e2e8f0;
  color: #64748b;
  font-size: 10px;
  font-weight: 800;
}

.option-toggle.toggle-on .option-state {
  background: #2563eb;
  color: #fff;
}
</style>
