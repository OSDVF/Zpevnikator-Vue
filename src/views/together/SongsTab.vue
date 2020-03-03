<template>
    <div class="likeMain">
		<div class="card bg-light">
			<div class="card-body">
				<h5 class="card-title">Můj obsah</h5>
				<p class="card-text">Spravujte své písně, nebo skupiny, ve kterých můžete sdílet playlisty</p>
			</div>
			<div class="expansion-panel list-group-item">
				<a aria-controls="collapseMySongs" aria-expanded="false" class="expansion-panel-toggler collapsed" data-toggle="collapse" href="#collapseMySongs" >
					<span><i class="material-icons">person_outline</i>&ensp;Mé písně</span>
					<div class="expansion-panel-icon ml-3 text-light-50">
						<i class="collapsed-show material-icons">keyboard_arrow_down</i>
						<i class="collapsed-hide material-icons">keyboard_arrow_up</i>
					</div>
				</a>
				<div class="collapse" id="collapseMySongs">
					<div class="expansion-panel-body">
						<span id="emptyMessage">Nepodařilo se načíst žádné vaše písně</span>
						<table id="mySongs" class="wpsongbook_list table table-striped table-hover table-bordered table-light">
							<thead><tr><th>Název</th><th>Autor</th><th>Jazyk</th></tr></thead>
							<tbody></tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>