<template>
    <i :class="'material-icons text-success loading-icon'+(display?'':' d-none')">check</i>
</template>
<script>
export default {
    props:{
        display: Boolean
    }
}
</script>