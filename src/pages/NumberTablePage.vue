<template>
  <q-page padding>
    <div>
      <q-btn @click="takePicture" label="Take Picture" color="primary" />
    </div>
    <div>
      <q-img v-if="imageUrl" fit="scale-down" width="512px" :src="imageUrl" style="margin-top: 20px;" />
    </div>
    <div v-if="isLoading">loading...</div>
    <CSVAsTable v-else-if="csvString" :csv="csvString" />
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { OpenAI } from 'openai';
import CSVAsTable from 'components/CSVAsTable.vue';
import { useStorage } from '@vueuse/core';

const $q = useQuasar();
const imageUrl = ref(null);
const csvString = ref(null);
const isLoading = ref(false);

function getApiKey() {
  const apiKey = useStorage('api-key', '')
  if(!apiKey.value) {
    apiKey.value = prompt('Please enter your api key')
  }
  return apiKey.value
}
const openai = new OpenAI({ apiKey: getApiKey(), dangerouslyAllowBrowser: true });

async function getFormattedMarkdown(image) {
  if (!runPrediction.value) {
    console.error('run prediction was false');
  }
  isLoading.value = true;
  runPrediction.value = false;
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a system that converts a picture of a handwritten table into a csv table. You output only the csv, containing the table, nothing else.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${image}`,
                detail: 'high'
              }
            }
          ]
        }
      ],
      temperature: 1,
      max_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    }, {
      maxRetries: 0
    });
    console.log(response);
    csvString.value = response.choices[0].message.content;
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error processing image' });
  }
  isLoading.value = false;
}

const runPrediction = ref(false);

async function takePicture() {
  try {
    runPrediction.value = true;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = async (event) => {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = async () => {
        const img = new Image();
        img.src = reader.result;

        img.onload = async () => {
          const maxDimension = 1024;
          let { width, height } = img;

          if (width > height) {
            if (width > maxDimension) {
              height *= maxDimension / width;
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width *= maxDimension / height;
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const resizedDataUrl = canvas.toDataURL('image/jpeg');
          imageUrl.value = resizedDataUrl;
          const base64Image = resizedDataUrl.split(',')[1];
          await getFormattedMarkdown(base64Image);
        };
      };
      reader.readAsDataURL(file);
    };
    input.click();
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error taking picture' });
  }
}
</script>
