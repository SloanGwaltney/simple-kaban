import Link from "next/link";
import { Collapse, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from "reactstrap";

export function AppNavbar() {
    return (
        <div>
            <Navbar color="light" expand="md" light>
                <NavbarBrand>
                    Simple Kanban
                </NavbarBrand>
                <Collapse className="me-auto" navbar>
                    <NavItem href="/register">
                        <Link href="/register">Register</Link>
                    </NavItem>
                </Collapse>
            </Navbar>
        </div>
    )
}