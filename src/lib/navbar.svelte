<script>
  import { Navbar, NavBrand, NavLi, NavUl, NavHamburger } from "flowbite-svelte";
</script>

<Navbar>
  <NavBrand href="/">
    <img src="/favicon.png" class="me-3 h-6 sm:h-9" alt="Flowbite Logo" />
    <span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white"
      >LibreNetworkDB</span
    >
  </NavBrand>
  <NavHamburger />
  <NavUl>
    <NavLi href="/">Home</NavLi>
    <NavLi href="/map">Map</NavLi>
    <NavLi href="/search">Search</NavLi>
    <NavLi href="/upload">Upload</NavLi>
    <NavLi href="/me">Profile</NavLi>
  </NavUl>
</Navbar>
