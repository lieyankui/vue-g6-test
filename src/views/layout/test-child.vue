<template>
  <div>
    子组件<br />
    <slot v-bind="{ data: info.data, name: '子组件title' }" :ref="slotRef">
      <!-- {{ info.title }} -->
    </slot>
    <slot
      name="slot2"
      v-bind="{
        data: { name: 'slot2name', date: 'xxxx年xx月' },
        name: '子组件title222',
      }"
      :ref="slotRef"
    ></slot>
  </div>
</template>

<script>
export default {
  name: "G6TestTestChild",
  props: {
    info: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      slotRef: "slotRef",
    };
  },

  mounted() {
    // const slotRef = this.$refs[this.slotRef];
    const slots = this.$slots;
    console.log("slots: ", slots);
  },

  methods: {},
};
</script>

<style lang="scss" scoped></style>
