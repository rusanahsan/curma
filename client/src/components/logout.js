export default function logout(){
    localStorage.removeItem('name');
    localStorage.removeItem('token');
    localStorage.removeItem('from');
    localStorage.removeItem('to');
    localStorage.removeItem('maneuvers');
    localStorage.removeItem('route_index');
    window.location.href="/loginOrRegister";
}