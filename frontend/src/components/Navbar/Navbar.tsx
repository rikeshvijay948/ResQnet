function Navbar() {
  return (
    <nav className="flex justify-between items-center px-8 py-5 bg-blue-700 text-white shadow-md">
      <h1 className="text-2xl font-bold">🚨 ResQNet</h1>

      <ul className="flex gap-8 font-medium">
        <li className="cursor-pointer hover:text-blue-200">Home</li>
        <li className="cursor-pointer hover:text-blue-200">Features</li>
        <li className="cursor-pointer hover:text-blue-200">About</li>
        <li className="cursor-pointer hover:text-blue-200">Login</li>
      </ul>
    </nav>
  );
}

export default Navbar;