<!--
* @Author       : heyongkui
* @Descripttion : layout组件
-->
<template>
  <div class="yok-container layout-container">
    <!-- <div class="yok-v-align">
      <img src="@/assets/logo.png" width="80" height="80" />
      aaaaaaaaaaaaaaaaa
    </div>
    <test-child :info="childInfo">
      <template #default="scope">
        <span>{{ scope.name }}</span>
        <div>
          <span>{{ scope.data.name }}</span>
          <span>{{ scope.data.date }}</span>
        </div>
      </template>
      <template #slot2="slot2Scope">
        <span>{{ slot2Scope.name }}</span>
        <div>
          <span>{{ slot2Scope.data.name }}</span>
          <span>{{ slot2Scope.data.date }}</span>
        </div>
      </template>
    </test-child> -->
    <multi-row
      :row="4"
      :text="text"
      :style="{ width: `${width}px` }"
    ></multi-row>
    <button class="yok-button" @click="changeText(1)">短文本</button>
    <button class="yok-button" @click="changeText(2)">长文本</button>
    <button class="yok-button" @click="changeText(3)">超长文本</button>
    <button class="yok-button" @click="changeWidth(false)">变窄</button>
    <button class="yok-button" @click="changeWidth(true)">变宽</button>
  </div>
</template>
<script>
// import testChild from "./test-child.vue";
export default {
  components: {
    // testChild,
  },
  props: {},
  data() {
    return {
      childInfo: {
        title: "子组件title",
        data: {
          name: "aaaaa",
          date: "2023年6月9日14:08:44",
        },
      },
      text: "3、新建一个div，并将文本内容所在标签的一些关键样式（宽度、行高、字体大小）设置到新的div，以方便在新的div中按照相同方式渲染文本，然后遍历文本内容，逐字添加到新的div中，并实时获取div高度，将其与限制高度进行比较，得到超出限定行数时字符对应的索引；",
      width: 300,
    };
  },
  mounted() {},
  methods: {
    changeText(flag) {
      if (flag === 1) {
        this.text =
          "新建一个div，并将文本内容所在标签的一些关键样式（宽度、行高、字体大小）设置";
      } else if (flag === 2) {
        this.text =
          "新建一个div，并将文本内容所在标签的一些关键样式（宽度、行高、字体大小）设置到新的div，以方便在新的div中按照相同方式渲染文本，然后遍历文本内容，逐字添加到新的div中，并实时获取div高度，将其与限制高度进行比较，得到超出限定行数时字符对应的索引";
      } else if (flag === 3) {
        this.text =
          "新建一个div，并将文本内容所在标签的一些关键样式（宽度、行高、字体大小）设置到新的div，以方便在新的div中按照相同方式渲染文本，然后遍历文本内容，逐字添加到新的div中，并实时获取div高度，将其与限制高度进行比较，得到超出限定行数时字符对应的索引新建一个div，并将文本内容所在标签的一些关键样式（宽度、行高、字体大小）设置到新的div，以方便在新的div中按照相同方式渲染文本，然后遍历文本内容，逐字添加到新的div中，并实时获取div高度，将其与限制高度进行比较，得到超出限定行数时字符对应的索引新建一个div，并将文本内容所在标签的一些关键样式（宽度、行高、字体大小）设置到新的div，以方便在新的div中按照相同方式渲染文本，然后遍历文本内容，逐字添加到新的div中，并实时获取div高度，将其与限制高度进行比较，得到超出限定行数时字符对应的索引新建一个div，并将文本内容所在标签的一些关键样式（宽度、行高、字体大小）设置到新的div，以方便在新的div中按照相同方式渲染文本，然后遍历文本内容，逐字添加到新的div中，并实时获取div高度，将其与限制高度进行比较，得到超出限定行数时字符对应的索引";
      }
    },
    changeWidth(flag) {
      if (flag) {
        this.width += 20;
      } else {
        this.width -= 20;
      }
    },
  },
};
</script>
<style lang="scss" scoped></style>
