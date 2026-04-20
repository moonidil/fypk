DEMO Walkthrough

Hello there.

The app is live : https://fypk.vercel.app/register

what to try

1. **Visit** https://fypk.vercel.app/
    register, log in, complete onboarding (your get your own unique url), and explore! 
2. **Explore canvas editor** in `/dashboard`:
    Click the + button to open the add block menu
    Try adding text, skills, image or project block
    Hover a block to see the drag dots and delete button
    Click and hold on a block's background to drag it to a new position on the canvas grid
    Click the corner handle to resize
    Click a blocks content to edit inline
3. **Try the project editor.** Click the `Projects` label in the sidebar, or `+ New project` in the picker. You'll see `/projects/[id]/edit` with:
    Title and visibility dropdown (Draft / Private / Public)
    Four narrative sections that auto-save on blur
    An evidence panel on the right for links, images, and notes
4. **Test out visibility** Change a project's visibility to Draft, then visit `/demo` again — the project card disappears from the public view. Set it back to Public to restore it.
5. **Finally, check out the public portfolio view**. With your chosen slug


**Interested to see a populated example?**
1. , or here's the given. Visit  https://fypk.vercel.app/demo
2. perhaps open a project narrative
3. Log in as the demo user. via  https://fypk.vercel.app/login 

Here is a demo account details if needed, though i **thoroughly** recommend making your own account and trying it out!
email: demo@koda.app
password: demo1234


Notes
* The app is built with Next.js, Typescript (which I've been learning), Tailwind, Prisma and PostgreSQL (neon). Authentication is credentials-based for now via Auth.js
* Data persists between sessions. changes made are live
* No GitHub integration in the prototype, see my reflection chapter for the scoping decision
