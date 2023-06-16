export default (file, prefix = "views") =>
  () =>
    import(`@/${prefix}/${file}.vue`);
