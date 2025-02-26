<template>
  <Header />
  <main>
    <slot />
  </main>
  <footer class="container mx-auto p-4">
    <div class=" text-gray-700 dark:text-gray-300 text-opacity-70">
      <div class='flex items-center justify-center text-sm'>
        <span>
          Copyright &copy; {{ new Date().getFullYear() }} Leafage. - License By
          <a href="https://github.com/little3201/leafage-pw/blob/main/LICENSE" rel="noopener noreferrer" target="_blank"
            class="hover:text-lime-600"> MIT</a>.
        </span>
      </div>
    </div>
  </footer>
</template>
