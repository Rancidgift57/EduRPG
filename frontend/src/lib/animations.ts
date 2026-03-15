import * as THREE from 'three';

export class BattleAnimator {
    private scene: THREE.Scene;  // ✅ needs scene passed in constructor

    constructor(scene: THREE.Scene) {
        this.scene = scene;  // ✅ fix: assign in constructor
    }

    playHeroAttack(hero: string, onComplete: () => void) {
        switch (hero) {
            case 'samurai': return this.swordSlash(onComplete);
            case 'wizard': return this.magicSpell(onComplete);
            case 'ninja': return this.shurikenThrow(onComplete);
            case 'knight': return this.shieldBash(onComplete);
            case 'robot': return this.laserBeam(onComplete);
            default: onComplete();
        }
    }

    swordSlash(onComplete: () => void) {
        const geo = new THREE.PlaneGeometry(3, 0.1);
        const mat = new THREE.MeshBasicMaterial({ color: 0xFFD700, transparent: true });
        const slash = new THREE.Mesh(geo, mat);
        this.scene.add(slash);
        let t = 0;
        const animate = () => {
            t += 0.05;
            slash.rotation.z = t * Math.PI;
            mat.opacity = Math.max(0, 1 - t);
            if (t < 1) requestAnimationFrame(animate);
            else { this.scene.remove(slash); onComplete(); }
        };
        animate();
    }

    magicSpell(onComplete: () => void) {
        const geo = new THREE.SphereGeometry(0.3, 16, 16);
        const mat = new THREE.MeshBasicMaterial({ color: 0x8B00FF, transparent: true });
        const orb = new THREE.Mesh(geo, mat);
        orb.position.set(-3, 0, 0);
        this.scene.add(orb);
        let t = 0;
        const animate = () => {
            t += 0.04;
            orb.position.x = -3 + t * 6;
            mat.opacity = Math.max(0, 1 - t);
            if (t < 1) requestAnimationFrame(animate);
            else { this.scene.remove(orb); onComplete(); }
        };
        animate();
    }

    shurikenThrow(onComplete: () => void) {
        const geo = new THREE.TorusGeometry(0.2, 0.05, 8, 6);
        const mat = new THREE.MeshBasicMaterial({ color: 0xC0C0C0 });
        const shuriken = new THREE.Mesh(geo, mat);
        shuriken.position.set(-3, 0, 0);
        this.scene.add(shuriken);
        let t = 0;
        const animate = () => {
            t += 0.05;
            shuriken.position.x = -3 + t * 6;
            shuriken.rotation.z += 0.3;
            if (t < 1) requestAnimationFrame(animate);
            else { this.scene.remove(shuriken); onComplete(); }
        };
        animate();
    }

    shieldBash(onComplete: () => void) {
        const geo = new THREE.BoxGeometry(0.8, 1.2, 0.1);
        const mat = new THREE.MeshBasicMaterial({ color: 0x4169E1, transparent: true });
        const shield = new THREE.Mesh(geo, mat);
        shield.position.set(0, 0, 0);
        this.scene.add(shield);
        let t = 0;
        const animate = () => {
            t += 0.06;
            shield.position.x = Math.sin(t * Math.PI) * 2;
            mat.opacity = Math.max(0, 1 - t);
            if (t < 1) requestAnimationFrame(animate);
            else { this.scene.remove(shield); onComplete(); }
        };
        animate();
    }

    laserBeam(onComplete: () => void) {
        const geo = new THREE.CylinderGeometry(0.05, 0.05, 6, 8);
        const mat = new THREE.MeshBasicMaterial({ color: 0x00FFFF, transparent: true });
        const laser = new THREE.Mesh(geo, mat);
        laser.rotation.z = Math.PI / 2;
        laser.position.set(0, 0, 0);
        this.scene.add(laser);
        let t = 0;
        const animate = () => {
            t += 0.05;
            mat.opacity = Math.max(0, 1 - t * 2);
            if (t < 0.5) requestAnimationFrame(animate);
            else { this.scene.remove(laser); onComplete(); }
        };
        animate();
    }
}