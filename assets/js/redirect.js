const target = document.currentScript?.dataset.target || document.querySelector('script[data-target]')?.dataset.target;
if (target?.startsWith('/') && !target.startsWith('//')) location.replace(target + location.search + location.hash);
