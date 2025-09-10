<template>
<div>
	<hr class="shadow-line" />
	<div class="ref">
		<h2>Auftragsübersicht</h2>
		<p>Übersicht über alle Job-Updates und deren Status</p>
		<hr class="shadow-line" />
		
		<div class="orders-management">
			<!-- Search and Filters -->
			<div class="search-section">
				<div class="search-input-container">
					<input 
						v-model="searchQuery"
						@input="onSearchInput"
						type="text" 
						class="search-input"
						placeholder="Aufträge durchsuchen (Mitarbeiter, Abteilung, Status)..."
					/>
					<div class="search-icon">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<circle cx="11" cy="11" r="8"></circle>
							<path d="m21 21-4.35-4.35"></path>
						</svg>
					</div>
				</div>
				
				<div class="filter-controls">
					<select v-model="selectedStatus" class="filter-select">
						<option value="">Alle Status</option>
						<option value="pending">Wartend</option>
						<option value="in_progress">In Bearbeitung</option>
						<option value="completed">Abgeschlossen</option>
						<option value="cancelled">Storniert</option>
					</select>
					
					<select v-model="selectedDepartment" class="filter-select">
						<option value="">Alle Abteilungen</option>
						<option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
					</select>
					
					<select v-model="selectedType" class="filter-select">
						<option value="">Alle Typen</option>
						<option value="role_change">Rollenwechsel</option>
						<option value="hardware_change">Hardware-Änderung</option>
						<option value="software_change">Software-Änderung</option>
						<option value="department_change">Abteilungswechsel</option>
					</select>
				</div>
			</div>

			<!-- Orders Table -->
			<div class="orders-table-container">
				<table class="orders-table">
					<thead>
						<tr>
							<th>Auftrag-ID</th>
							<th>Mitarbeiter</th>
							<th>Abteilung</th>
							<th>Typ</th>
							<th>Status</th>
							<th>Erstellt</th>
							<th>Bearbeitet</th>
							<th>Aktionen</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="order in filteredOrders" :key="order.id" class="order-row">
							<td>
								<div class="order-id">
									<span class="id-number">#{{ order.id }}</span>
								</div>
							</td>
							<td>
								<div class="employee-info">
									<div class="employee-avatar">
										{{ order.employee_name.charAt(0).toUpperCase() }}
									</div>
									<div class="employee-details">
										<div class="employee-name">{{ order.employee_name }}</div>
										<div class="employee-email">{{ order.employee_email }}</div>
									</div>
								</div>
							</td>
							<td>{{ order.department }}</td>
							<td>
								<span class="type-badge">{{ getTypeLabel(order.type) }}</span>
							</td>
							<td>
								<span :class="`status-badge ${order.status}`">{{ getStatusLabel(order.status) }}</span>
							</td>
							<td>{{ formatDate(order.created_at) }}</td>
							<td>{{ formatDate(order.updated_at) }}</td>
							<td>
								<div class="action-buttons">
									<button @click="viewOrder(order)" class="action-btn view" title="Details anzeigen">
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
											<circle cx="12" cy="12" r="3"></circle>
										</svg>
									</button>
									<button v-if="order.status === 'pending'" @click="processOrder(order)" class="action-btn process" title="Bearbeiten">
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
											<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
										</svg>
									</button>
									<button v-if="order.status === 'pending'" @click="cancelOrder(order)" class="action-btn cancel" title="Stornieren">
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<line x1="18" y1="6" x2="6" y2="18"></line>
											<line x1="6" y1="6" x2="18" y2="18"></line>
										</svg>
									</button>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			<!-- Order Details Modal -->
			<div v-if="showOrderModal" class="modal-overlay" @click="closeOrderModal">
				<div class="modal-content" @click.stop>
					<div class="modal-header">
						<h3>Auftrag Details - #{{ selectedOrder?.id }}</h3>
						<button @click="closeOrderModal" class="close-btn">×</button>
					</div>
					<div class="modal-body">
						<div class="order-details" v-if="selectedOrder">
							<div class="detail-section">
								<h4>Mitarbeiter Information</h4>
								<p><strong>Name:</strong> {{ selectedOrder.employee_name }}</p>
								<p><strong>E-Mail:</strong> {{ selectedOrder.employee_email }}</p>
								<p><strong>Abteilung:</strong> {{ selectedOrder.department }}</p>
							</div>
							
							<div class="detail-section">
								<h4>Auftrag Information</h4>
								<p><strong>Typ:</strong> {{ getTypeLabel(selectedOrder.type) }}</p>
								<p><strong>Status:</strong> {{ getStatusLabel(selectedOrder.status) }}</p>
								<p><strong>Erstellt:</strong> {{ formatDate(selectedOrder.created_at) }}</p>
								<p><strong>Zuletzt bearbeitet:</strong> {{ formatDate(selectedOrder.updated_at) }}</p>
							</div>
							
							<div class="detail-section" v-if="selectedOrder.changes">
								<h4>Änderungen</h4>
								<div class="changes-list">
									<div v-for="(change, key) in selectedOrder.changes" :key="key" class="change-item">
										<strong>{{ getChangeLabel(key) }}:</strong>
										<span class="old-value">{{ change.old }}</span> → 
										<span class="new-value">{{ change.new }}</span>
									</div>
								</div>
							</div>
							
							<div class="detail-section" v-if="selectedOrder.notes">
								<h4>Notizen</h4>
								<p>{{ selectedOrder.notes }}</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue';
import orderService from '@/services/orderService';

const emit = defineEmits(['go-back']);

const searchQuery = ref('');
const selectedStatus = ref('');
const selectedDepartment = ref('');
const selectedType = ref('');
const showOrderModal = ref(false);
const selectedOrder = ref(null);

const orders = ref([]);
const departments = ref(['IT', 'HR', 'Finanzen', 'Marketing', 'Vertrieb', 'Produktion']);

const loading = ref(false);
const currentPage = ref(1);
const totalPages = ref(1);

// Load orders data from API
const loadOrders = async () => {
	loading.value = true;
	try {
		const params = {
			page: currentPage.value,
			per_page: 20
		};
		
		if (searchQuery.value) {
			params.search = searchQuery.value;
		}
		if (selectedStatus.value) {
			params.status = selectedStatus.value;
		}
		if (selectedDepartment.value) {
			params.department = selectedDepartment.value;
		}
		if (selectedType.value) {
			params.type = selectedType.value;
		}
		
		const response = await orderService.getOrders(params);
		
		if (response.data) {
			orders.value = response.data;
			currentPage.value = response.current_page;
			totalPages.value = response.last_page;
		}
		
	} catch (error) {
		console.error('Fehler beim Laden der Aufträge:', error);
		// Fallback to mock data
		orders.value = [
			{
				id: 1001,
				employee_name: 'Max Mustermann',
				employee_email: 'max.mustermann@company.com',
				department: 'IT',
				type: 'role_change',
				status: 'pending',
				created_at: '2024-01-15T10:30:00',
				updated_at: '2024-01-15T10:30:00',
				changes: {
					role: { old: 'Entwickler', new: 'Senior Entwickler' },
					team: { old: 'Frontend Team', new: 'Full Stack Team' }
				},
				notes: 'Beförderung nach erfolgreichem Projekt'
			},
			{
				id: 1002,
				employee_name: 'Anna Schmidt',
				employee_email: 'anna.schmidt@company.com',
				department: 'HR',
				type: 'hardware_change',
				status: 'completed',
				created_at: '2024-01-14T16:45:00',
				updated_at: '2024-01-15T09:20:00',
				changes: {
					hardware: { old: 'MacBook Air M1', new: 'MacBook Pro M2' }
				},
				notes: 'Upgrade für bessere Performance'
			}
		];
	} finally {
		loading.value = false;
	}
};

const filteredOrders = computed(() => {
	let filtered = orders.value;
	
	if (searchQuery.value) {
		const query = searchQuery.value.toLowerCase();
		filtered = filtered.filter(order => 
			order.employee_name.toLowerCase().includes(query) ||
			order.employee_email.toLowerCase().includes(query) ||
			order.department.toLowerCase().includes(query) ||
			order.id.toString().includes(query)
		);
	}
	
	if (selectedStatus.value) {
		filtered = filtered.filter(order => order.status === selectedStatus.value);
	}
	
	if (selectedDepartment.value) {
		filtered = filtered.filter(order => order.department === selectedDepartment.value);
	}
	
	if (selectedType.value) {
		filtered = filtered.filter(order => order.type === selectedType.value);
	}
	
	return filtered;
});

const onSearchInput = () => {
	// Debounce implementation could be added here
};

const getStatusLabel = (status) => {
	const labels = {
		pending: 'Wartend',
		in_progress: 'In Bearbeitung',
		completed: 'Abgeschlossen',
		cancelled: 'Storniert'
	};
	return labels[status] || status;
};

const getTypeLabel = (type) => {
	const labels = {
		role_change: 'Rollenwechsel',
		hardware_change: 'Hardware-Änderung',
		software_change: 'Software-Änderung',
		department_change: 'Abteilungswechsel'
	};
	return labels[type] || type;
};

const getChangeLabel = (key) => {
	const labels = {
		role: 'Rolle',
		team: 'Team',
		department: 'Abteilung',
		hardware: 'Hardware',
		software: 'Software',
		sap_profile: 'SAP Profil'
	};
	return labels[key] || key;
};

const formatDate = (date) => {
	return new Intl.DateTimeFormat('de-DE', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	}).format(new Date(date));
};

const viewOrder = (order) => {
	selectedOrder.value = order;
	showOrderModal.value = true;
};

const processOrder = async (order) => {
	try {
		await orderService.updateOrderStatus(order.id, 'in_progress');
		await loadOrders(); // Reload the list
	} catch (error) {
		console.error('Fehler beim Bearbeiten des Auftrags:', error);
		alert('Fehler beim Bearbeiten des Auftrags');
	}
};

const cancelOrder = async (order) => {
	if (confirm(`Auftrag #${order.id} wirklich stornieren?`)) {
		try {
			await orderService.updateOrderStatus(order.id, 'cancelled');
			await loadOrders(); // Reload the list
		} catch (error) {
			console.error('Fehler beim Stornieren des Auftrags:', error);
			alert('Fehler beim Stornieren des Auftrags');
		}
	}
};


const closeOrderModal = () => {
	showOrderModal.value = false;
	selectedOrder.value = null;
};

// Watch for filter changes - debounce search only
let searchTimeout;
watch(searchQuery, () => {
	clearTimeout(searchTimeout);
	searchTimeout = setTimeout(() => {
		currentPage.value = 1;
		loadOrders();
	}, 300);
});

// Watch for filter changes - immediate for dropdowns
watch([selectedStatus, selectedDepartment, selectedType], () => {
	currentPage.value = 1; // Reset to first page
	loadOrders();
});

onMounted(() => {
	loadOrders();
});
</script>

<style scoped>
.ref {
	max-width: 1400px;
	margin: 0 auto;
}

.search-section {
	margin-bottom: 2rem;
}

.search-input-container {
	position: relative;
	margin-bottom: 1rem;
}

.search-input {
	width: 100%;
	padding: 0.75rem 2.5rem 0.75rem 1rem;
	border: 2px solid var(--color-border);
	border-radius: 0.5rem;
	background: var(--color-background);
	color: var(--color-text);
	font-size: 1rem;
	transition: all 0.2s ease;
}

.search-input:focus {
	outline: none;
	border-color: var(--color-button);
}

.search-icon {
	position: absolute;
	right: 0.75rem;
	top: 50%;
	transform: translateY(-50%);
	color: var(--color-text-muted);
}

.filter-controls {
	display: flex;
	gap: 1rem;
	align-items: center;
	flex-wrap: wrap;
}

.filter-select {
	padding: 0.5rem;
	border: 1px solid var(--color-border);
	border-radius: 0.25rem;
	background: var(--color-background);
	color: var(--color-text);
}

.orders-table-container {
	overflow-x: auto;
	border: 1px solid var(--color-border);
	border-radius: 0.5rem;
}

.orders-table {
	width: 100%;
	border-collapse: collapse;
}

.orders-table th {
	background: var(--color-background-mute);
	color: var(--color-text);
	padding: 1rem;
	text-align: left;
	font-weight: 600;
	border-bottom: 1px solid var(--color-border);
}

.order-row {
	border-bottom: 1px solid var(--color-border);
	transition: background-color 0.2s ease;
}

.order-row:hover {
	background: var(--color-background-soft);
}

.orders-table td {
	padding: 1rem;
	vertical-align: middle;
}

.order-id {
	font-weight: 600;
	color: var(--color-button);
}

.employee-info {
	display: flex;
	align-items: center;
	gap: 0.75rem;
}

.employee-avatar {
	width: 2.5rem;
	height: 2.5rem;
	background: var(--color-button);
	color: var(--color-text);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 600;
	font-size: 1rem;
}

.employee-name {
	font-weight: 500;
	color: var(--color-text);
}

.employee-email {
	font-size: 0.8rem;
	color: var(--color-text-muted);
}

.type-badge {
	background: var(--color-background-soft);
	color: var(--color-text);
	padding: 0.25rem 0.5rem;
	border-radius: 0.25rem;
	font-size: 0.8rem;
	font-weight: 500;
}

.status-badge {
	padding: 0.25rem 0.5rem;
	border-radius: 0.25rem;
	font-size: 0.8rem;
	font-weight: 500;
}

.status-badge.pending {
	background: rgba(251, 191, 36, 0.1);
	color: rgb(251, 191, 36);
}

.status-badge.in_progress {
	background: rgba(59, 130, 246, 0.1);
	color: rgb(59, 130, 246);
}

.status-badge.completed {
	background: rgba(34, 197, 94, 0.1);
	color: rgb(34, 197, 94);
}

.status-badge.cancelled {
	background: rgba(239, 68, 68, 0.1);
	color: rgb(239, 68, 68);
}

.action-buttons {
	display: flex;
	gap: 0.5rem;
}

.action-btn {
	padding: 0.5rem !important;
	border: none !important;
	border-radius: 0.25rem;
	cursor: pointer;
	transition: all 0.2s ease;
	display: flex;
	align-items: center;
	justify-content: center;
}

.action-btn.view {
	background: rgba(59, 130, 246, 0.1) !important;
	color: rgb(59, 130, 246) !important;
}

.action-btn.view:hover {
	background: rgb(59, 130, 246) !important;
	color: white !important;
}

.action-btn.process {
	background: rgba(34, 197, 94, 0.1) !important;
	color: rgb(34, 197, 94) !important;
}

.action-btn.process:hover {
	background: rgb(34, 197, 94) !important;
	color: white !important;
}

.action-btn.cancel {
	background: rgba(239, 68, 68, 0.1) !important;
	color: rgb(239, 68, 68) !important;
}

.action-btn.cancel:hover {
	background: rgb(239, 68, 68) !important;
	color: white !important;
}


/* Modal Styles */
.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
}

.modal-content {
	background: var(--color-background);
	border-radius: 0.5rem;
	width: 90%;
	max-width: 600px;
	max-height: 90vh;
	overflow-y: auto;
}

.modal-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 1.5rem;
	border-bottom: 1px solid var(--color-border);
}

.modal-header h3 {
	margin: 0;
	color: var(--color-text);
}

.close-btn {
	background: none !important;
	border: none !important;
	font-size: 1.5rem;
	cursor: pointer;
	color: var(--color-text-muted) !important;
}

.modal-body {
	padding: 1.5rem;
}

.detail-section {
	margin-bottom: 1.5rem;
}

.detail-section h4 {
	margin: 0 0 0.5rem 0;
	color: var(--color-text);
}

.detail-section p {
	margin: 0.25rem 0;
	color: var(--color-text);
}

.changes-list {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.change-item {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.5rem;
	background: var(--color-background-soft);
	border-radius: 0.25rem;
}

.old-value {
	color: rgba(239, 68, 68, 0.8);
	text-decoration: line-through;
}

.new-value {
	color: rgba(34, 197, 94, 0.8);
	font-weight: 500;
}

.shadow-line {
	border: 0;
	height: 1px;
	background: linear-gradient(90deg, transparent, var(--color-border), transparent);
	margin: 2rem 0;
}

@media (max-width: 768px) {
	.orders-table {
		font-size: 0.9rem;
	}
	
	.orders-table th,
	.orders-table td {
		padding: 0.5rem;
	}
	
	.filter-controls {
		flex-direction: column;
		align-items: stretch;
	}
	
	.employee-info {
		flex-direction: column;
		align-items: flex-start;
		gap: 0.25rem;
	}
	
	.employee-avatar {
		width: 2rem;
		height: 2rem;
		font-size: 0.9rem;
	}
}
</style>