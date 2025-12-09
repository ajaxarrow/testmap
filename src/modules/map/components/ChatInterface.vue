<script setup lang="ts">
import { ref, nextTick, computed } from 'vue'
import { PhX, PhPaperPlaneTilt, PhRobot, PhUser, PhDownload } from '@phosphor-icons/vue'
import { marked } from 'marked'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const messages = ref<Message[]>([])
const userInput = ref('')
const isLoading = ref(false)
const error = ref('')
const chatContainer = ref<HTMLElement | null>(null)
const downloadingPDF = ref<string | null>(null)

// Configure marked for better rendering
marked.setOptions({
  breaks: true,
  gfm: true,
})

const formattedMessages = computed(() => {
  return messages.value.map(msg => ({
    ...msg,
    htmlContent: msg.role === 'assistant' ? marked(msg.content) : msg.content
  }))
})

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return

  const userMessage: Message = {
    id: Date.now().toString(),
    role: 'user',
    content: userInput.value,
    timestamp: new Date()
  }

  messages.value.push(userMessage)
  const currentInput = userInput.value
  userInput.value = ''
  error.value = ''
  isLoading.value = true

  await scrollToBottom()

  try {
    const formData = new FormData()
    formData.append('message', currentInput)
    formData.append('generate_pdf', 'false')

    const response = await fetch('http://localhost:8000/api/converse/', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`)
    }

    const data = await response.json()

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: data.response || 'No response received',
      timestamp: new Date()
    }

    messages.value.push(assistantMessage)
    await scrollToBottom()
  } catch (err: any) {
    console.error('Chat error:', err)
    error.value = err.message || 'Failed to send message. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const downloadAsPDF = async (messageId: string, messageContent: string) => {
  try {
    downloadingPDF.value = messageId
    error.value = ''
    
    const formData = new FormData()
    formData.append('message', messageContent)
    formData.append('generate_pdf', 'true')

    const response = await fetch('http://localhost:8000/api/converse/', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`PDF generation failed: ${response.status}`)
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gis_analysis_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  } catch (err: any) {
    console.error('PDF download error:', err)
    error.value = 'Failed to generate PDF. Please try again.'
  } finally {
    downloadingPDF.value = null
  }
}

const clearChat = () => {
  messages.value = []
  error.value = ''
}

const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="chat-overlay" @click.self="emit('close')">
      <div class="chat-container" @click.stop>
        <!-- Header -->
        <div class="chat-header">
          <div class="d-flex align-center gap-3">
            <PhRobot size="28" weight="fill" class="text-primary" color="white" />
            <div class="ml-2">
              <h3 class="chat-title">GIS AI Assistant</h3>
              <p class="chat-subtitle">Health & Disaster Risk Analysis</p>
            </div>
          </div>
          <div class="d-flex align-center gap-2">
            <VBtn
              v-if="messages.length > 0"
              size="small"
              variant="text"
              color="grey"
              @click="clearChat"
            >
              Clear
            </VBtn>
            <PhX
              size="24"
              weight="bold"
              class="cursor-pointer text-grey"
              @click="emit('close')"
            />
          </div>
        </div>

        <VDivider />

        <!-- Messages Area -->
        <div ref="chatContainer" class="chat-messages">
          <div v-if="messages.length === 0" class="empty-state">
            <PhRobot size="64" weight="duotone" class="text-grey" />
            <p class="text-h6 mt-4">Hello! I'm your GIS AI Assistant</p>
            <p class="text-body-2 text-grey">
              Ask me about health risks, disaster analysis, flood patterns, or disease correlations
            </p>
          </div>

          <div
            v-for="msg in formattedMessages"
            :key="msg.id"
            class="message-wrapper"
            :class="msg.role"
          >
            <div class="message-avatar">
              <PhUser v-if="msg.role === 'user'" size="20" weight="fill" />
              <PhRobot v-else size="20" weight="fill" />
            </div>
            <div class="message-content">
              <div class="message-header">
                <span class="message-role">{{ msg.role === 'user' ? 'You' : 'AI Assistant' }}</span>
                <span class="message-time">{{ msg.timestamp.toLocaleTimeString() }}</span>
              </div>
              <div
                v-if="msg.role === 'user'"
                class="message-text"
              >
                {{ msg.content }}
              </div>
              <div
                v-else
                class="message-text markdown-content"
                v-html="msg.htmlContent"
              />
              <div v-if="msg.role === 'assistant'" class="message-actions">
                <VBtn
                  size="x-small"
                  variant="text"
                  color="primary"
                  :loading="downloadingPDF === msg.id"
                  :disabled="downloadingPDF === msg.id"
                  @click="downloadAsPDF(msg.id, msg.content)"
                >
                  <PhDownload size="14" class="mr-1" />
                  {{ downloadingPDF === msg.id ? 'Generating...' : 'Download PDF' }}
                </VBtn>
              </div>
            </div>
          </div>

          <div v-if="isLoading" class="message-wrapper assistant">
            <div class="message-avatar">
              <PhRobot size="20" weight="fill" />
            </div>
            <div class="message-content">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>

        <VDivider />

        <!-- Input Area -->
        <div class="chat-input-wrapper">
          <VAlert
            v-if="error"
            type="error"
            variant="tonal"
            density="compact"
            closable
            class="mb-2"
            @click:close="error = ''"
          >
            {{ error }}
          </VAlert>

          <div class="chat-input-container">
            <VTextarea
              v-model="userInput"
              placeholder="Ask about health risks, flood analysis, disease patterns..."
              variant="outlined"
              rows="2"
              auto-grow
              hide-details
              :disabled="isLoading"
              @keypress="handleKeyPress"
            />
            <VBtn
              icon
              color="primary"
              :disabled="!userInput.trim() || isLoading"
              :loading="isLoading"
              @click="sendMessage"
            >
              <PhPaperPlaneTilt size="20" weight="fill" />
            </VBtn>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.chat-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.chat-container {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 900px;
  height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%);
  color: white;
}

.chat-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: white;
}

.chat-subtitle {
  font-size: 12px;
  margin: 0;
  opacity: 0.9;
  color: white;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background-color: #f8f9fa;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: #666;
}

.message-wrapper {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.message-wrapper.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message-wrapper.user .message-avatar {
  background-color: #2E7D32;
  color: white;
}

.message-wrapper.assistant .message-avatar {
  background-color: #E8F5E8;
  color: #2E7D32;
}

.message-content {
  flex: 1;
  max-width: 75%;
}

.message-wrapper.user .message-content {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.message-header {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 4px;
  font-size: 12px;
}

.message-role {
  font-weight: 600;
  color: #333;
}

.message-time {
  color: #999;
  font-size: 11px;
}

.message-text {
  background: white;
  padding: 12px 16px;
  border-radius: 12px;
  color: #333;
  line-height: 1.5;
  word-wrap: break-word;
}

.message-wrapper.user .message-text {
  background: linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%);
  color: white;
}

.message-wrapper.assistant .message-text {
  border: 1px solid #e0e0e0;
}

.message-actions {
  margin-top: 8px;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #999;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.7;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

.chat-input-wrapper {
  padding: 16px 24px;
  background: white;
  border-top: 1px solid #e0e0e0;
}

.chat-input-container {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Markdown content styling */
.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3) {
  margin-top: 16px;
  margin-bottom: 8px;
  font-weight: 600;
}

.markdown-content :deep(h1) {
  font-size: 20px;
  border-bottom: 2px solid #2E7D32;
  padding-bottom: 4px;
}

.markdown-content :deep(h2) {
  font-size: 18px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 4px;
}

.markdown-content :deep(h3) {
  font-size: 16px;
}

.markdown-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 12px 0;
  font-size: 13px;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.markdown-content :deep(th) {
  background-color: #f8f9fa;
  font-weight: 600;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  padding-left: 20px;
  margin: 8px 0;
}

.markdown-content :deep(li) {
  margin-bottom: 4px;
}

.markdown-content :deep(p) {
  margin: 8px 0;
}

.markdown-content :deep(code) {
  background-color: #f4f4f4;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 13px;
  font-family: 'Courier New', monospace;
}

.markdown-content :deep(pre) {
  background-color: #f4f4f4;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 12px 0;
}

.markdown-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
}

.markdown-content :deep(strong) {
  font-weight: 600;
}

.markdown-content :deep(em) {
  font-style: italic;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid #2E7D32;
  padding-left: 16px;
  margin: 12px 0;
  color: #666;
  font-style: italic;
}
</style>
