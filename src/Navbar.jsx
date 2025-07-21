import { FaUserCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar">
      <h1>KOMUNI</h1>
      <Link to="/perfil">
        <FaUserCircle size={28} />
      </Link>
    </nav>
  );
}
