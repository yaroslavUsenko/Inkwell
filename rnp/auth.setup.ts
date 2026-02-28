import { test as setup } from '@playwright/test'

// Registers the shared test user that is used across blog-post, comment,
// login, logout, and profile specs. Runs once before any test file.
//   201 = created successfully
//   409 = already exists (idempotent — safe to ignore)
setup('create test user', async ({ request }) => {
  const res = await request.post('http://localhost:5000/api/auth/register', {
    data: {
      name: 'usenko',
      email: 'usenko.0265@gmail.com',
      password: '654321',
    },
    failOnStatusCode: false,
  })

  const status = res.status()
  if (status !== 201 && status !== 409) {
    throw new Error(`Failed to create test user: HTTP ${status} — ${await res.text()}`)
  }
})
