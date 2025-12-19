// Generate mock blog posts
const blogData = [
  {
    title: 'Protective Styles That Love Your Hair',
    slug: 'protective-styles-that-love-your-hair',
    excerpt: 'Why braids, twists, and locs are more than just a look.',
    content: `
      <p>Protective styles do more than turn heads—they shield your natural hair from daily wear and tear.</p>
      <p>At Haus of Lewks, every style is customized to your hair texture, lifestyle, and goals so you leave the chair confident and cared for.</p>
      <h2>Benefits of Protective Styles</h2>
      <p>Protective styles help retain length, reduce manipulation, and give your natural hair a break from styling stress.</p>
      <h2>Popular Options</h2>
      <ul>
        <li>Box Braids - Versatile and long-lasting</li>
        <li>Knotless Braids - Comfortable and natural-looking</li>
        <li>Cornrows - Classic and protective</li>
        <li>Locs - Low-maintenance long-term solution</li>
      </ul>
    `,
    coverImageUrl: 'https://images.unsplash.com/photo-1592328906746-0a3ca0bde253?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YnJhaWRzfGVufDB8fDB8fHww',
    isPublished: true,
    publishedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
  },
  {
    title: 'How to Prep for Your Appointment',
    slug: 'how-to-prep-for-your-appointment',
    excerpt: 'Simple steps to make your appointment smoother and faster.',
    content: `
      <p>Arrive with clean, product-free hair that's been blown out or stretched.</p>
      <p>Not sure what style to pick? Bring reference photos and we'll help you decide what works best for your hair and schedule.</p>
      <h2>Preparation Checklist</h2>
      <ul>
        <li>Wash your hair 1-2 days before</li>
        <li>Deep condition if needed</li>
        <li>Blow dry or stretch your hair</li>
        <li>Remove any previous braids or extensions</li>
        <li>Bring reference photos</li>
        <li>Arrive on time</li>
      </ul>
      <h2>What to Bring</h2>
      <p>Bring any hair products you prefer, reference images, and a positive attitude!</p>
    `,
    coverImageUrl: 'https://images.unsplash.com/photo-1603881367350-c2d8b6b23494',
    isPublished: true,
    publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
  },
  {
    title: 'Maintaining Your Braids',
    slug: 'maintaining-your-braids',
    excerpt: 'Tips for keeping your braids looking fresh and your scalp healthy.',
    content: `
      <p>Proper maintenance is key to getting the most out of your protective style.</p>
      <h2>Daily Care</h2>
      <ul>
        <li>Wrap your hair at night with a satin scarf or bonnet</li>
        <li>Keep your scalp moisturized</li>
        <li>Don't pull or tug at your braids</li>
      </ul>
      <h2>Weekly Maintenance</h2>
      <ul>
        <li>Wash your scalp weekly with a gentle shampoo</li>
        <li>Condition the length of your braids</li>
        <li>Re-twist any loose ends</li>
      </ul>
    `,
    coverImageUrl: 'https://images.unsplash.com/photo-1592328906746-0a3ca0bde253?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YnJhaWRzfGVufDB8fDB8fHww',
    isPublished: true,
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
  },
  {
    title: 'Choosing the Right Style for Your Lifestyle',
    slug: 'choosing-right-style-for-lifestyle',
    excerpt: 'A guide to selecting protective styles that fit your daily routine.',
    content: `
      <p>Different protective styles work better for different lifestyles and hair types.</p>
      <h2>Active Lifestyle</h2>
      <p>For those who exercise frequently, consider styles that are easy to maintain and don't require frequent touch-ups.</p>
      <h2>Professional Environment</h2>
      <p>Choose styles that are polished and professional while still protecting your natural hair.</p>
    `,
    coverImageUrl: 'https://images.unsplash.com/photo-1590080875948-4f58f681a6d2',
    isPublished: false // Draft
  }
];

export default blogData;

