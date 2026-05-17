export interface AssignEmployeeCommand {
	ownerIdFromToken: number;
	emailOrPhone: string;
}

export interface RemoveEmployeeCommand {
	ownerIdFromToken: number;
	clientId: number;
}

export interface ListEmployeesCommand {
	ownerIdFromToken: number;
}

export interface EmployeeResult {
	employeeId: number;
	clientId: number;
	businessId: number;
	createdAt: string;
}
