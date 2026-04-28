import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import About from "../components/About";
import Approach from "../components/Approach";
import Expertise from "../components/Expertise";
import Delivery from "../components/Delivery";
import ValueProp from "../components/ValueProp";
import Contact from "../components/Contact";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Approach />
        <Expertise />
        <Delivery />
        <ValueProp />
        <Contact />
      </main>
    </>
  );
}
