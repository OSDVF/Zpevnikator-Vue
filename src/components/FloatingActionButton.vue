<template>
  <div :class="{'fab-right':true,'shifted-up':shiftedUp}">
    <button :class="'btn btn-float btn-'+color+' m-3'" type="button" data-placement="left" data-toggle="tooltip" :title="title" @click="$emit('click')">
      <i class="material-icons">{{icon}}</i>
    </button>
  </div>
</template>
<script>
/**
 * Floating action button - defaults to a 'refresh button'
 * @vue-prop {boolean} [shiftedUp=false] Shift to the top a bit - use when using bottom navbar
 * @vue-prop {'primary'|'secondary'|'success'|'danger'|'warning'} [color='secondary'] Bootstrap button color
 * @vue-event {Event} click
 */
export default {
	props: {
		icon: {
			default: "refresh",
			type: String,
			required: false
		},
		color: {
			default: "secondary",
			type: String,
			required: false
		},
		title: {
			default: "Aktualizovat seznam",
			type: String,
			required: false
		},
		shiftedUp: {
			type: Boolean,
			default: false,
			required: false
		}
	}
};
</script>