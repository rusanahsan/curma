import React from "react";
import Navbar from '../components/Navbar'
import logout from '../components/logout'

export default function About() {
  if(!localStorage.getItem('name'))
    logout();
  return (
    <main>
      <Navbar/>
      <section>
        <h1 className="text-center my-5">ABOUT CURMA API</h1>
        <p className="px-5">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsam, tempora! Rem quae laborum, quos error nihil sequi eum maiores, officiis nesciunt ex quod libero veritatis at optio neque accusantium molestiae modi porro, voluptatem soluta id? Fuga voluptatum obcaecati, eius nisi sint praesentium possimus consectetur in, exercitationem suscipit id dolorem ad quos neque laudantium recusandae ullam nihil. Labore laborum incidunt laboriosam, consequuntur obcaecati corrupti beatae quibusdam quas ullam, dolor facere necessitatibus voluptatum alias tempore veniam facilis, molestias dolore ex tempora? Quasi sequi aut necessitatibus asperiores expedita recusandae repudiandae. Atque, sapiente asperiores! Illo eos mollitia quibusdam excepturi repellendus voluptate laboriosam? Dicta, neque.
        </p>
        <p className="px-5">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsam, tempora! Rem quae laborum, quos error nihil sequi eum maiores, officiis nesciunt ex quod libero veritatis at optio neque accusantium molestiae modi porro, voluptatem soluta id? Fuga voluptatum obcaecati, eius nisi sint praesentium possimus consectetur in, exercitationem suscipit id dolorem ad quos neque laudantium recusandae ullam nihil. Labore laborum incidunt laboriosam, consequuntur obcaecati corrupti beatae quibusdam quas ullam, dolor facere necessitatibus voluptatum alias tempore veniam facilis, molestias dolore ex tempora? Quasi sequi aut necessitatibus asperiores expedita recusandae repudiandae. Atque, sapiente asperiores! Illo eos mollitia quibusdam excepturi repellendus voluptate laboriosam? Dicta, neque.
        </p>
      </section>
    </main>
  );
}
