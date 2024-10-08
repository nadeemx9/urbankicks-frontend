export interface AuthenticatedUser {
    userId: number;
    email: string;
    password: string;
    firstname: string;
    lastname: string;
    address: string;
    mobile: string;
    role: string;
    stateId: number;
    stateName: string;
    districtId: number;
    districtName: string;
    lastLoggedIn: string;
}
